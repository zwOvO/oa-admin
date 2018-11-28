import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Card,
  Form,
  Modal,
  Row,
  Col,
  Avatar, Input, Button, DatePicker, Select
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import ExportJsonExcel from "js-export-excel";
import styles from './TableList.less';

const FormItem = Form.Item;
const MonthPicker = DatePicker.MonthPicker;
const { Option } = Select;

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const monthFormat = 'YYYY-MM';

@Form.create()
class AuditForm extends PureComponent {
  constructor(props) {
    super(props);
    console.log(props.values);

    this.formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
  }

  render() {
    const { auditModalVisible, handleUpdateModalVisible ,handleFormReset,handleUserFormSubmit ,values,form } = this.props;

    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Modal
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title={<div><Avatar src={values.avatar} />  注册时间：{values.createTime}</div>}
        visible={auditModalVisible}
        onCancel={() => handleUpdateModalVisible()}
        onOk={() => handleUserFormSubmit(form,handleFormReset)}
      >
        <div>

          <Form>
            <FormItem label="用户标识" {...this.formLayout}>
              {getFieldDecorator('openId', {
                rules: [{ required: true, message: '请输入用户标识' }],
                initialValue: values.openId,
              })(<Input placeholder="请输入" disabled />)}
            </FormItem>
            <FormItem label="用户姓名" {...this.formLayout}>
              {getFieldDecorator('nickname', {
                rules: [{ required: true, message: '请输入用户昵称' }],
                initialValue: values.nickname,
              })(<Input placeholder="请输入" />)}
            </FormItem>
            <FormItem label="用户姓名" {...this.formLayout}>
              {getFieldDecorator('username', {
                rules: [{ required: true, message: '请输入用户姓名' }],
                initialValue: values.username,
              })(<Input placeholder="请输入" />)}
            </FormItem>
            <FormItem label="用户性别" {...this.formLayout}>
              {getFieldDecorator('gender', {
                rules: [{ required: true, message: '请选择用户性别' }],
                initialValue: values.gender==="男"?"1":"2",
              })(
                <Select placeholder="请选择">
                  <Option value="1">男</Option>
                  <Option value="2">女</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="启用状态" {...this.formLayout}>
              {getFieldDecorator('status', {
                rules: [{ required: true, message: '请选择启用状态' }],
                initialValue: values.status==="启用"?"1":"2",
              })(
                <Select placeholder="请选择">
                  <Option value="1">启用</Option>
                  <Option value="2">禁用</Option>
                </Select>
              )}
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ userManager, loading }) => ({
  userManager,
  loading: loading.models.userManager,
}))
@Form.create()
class TableList extends PureComponent {
  state = {
    auditModalVisible: false,
    selectedRows: [],
    formValues: {},
    stepFormValues: {},
  };

  columns = [
    {
      title: '用户昵称',
      dataIndex: 'nickname',
    },
    {
      title: '用户姓名',
      dataIndex: 'username',
    },
    {
      title: '用户性别',
      dataIndex: 'gender',
    },
    {
      title: '启用状态',
      dataIndex: 'status',
    },
    // {
    //   title: '服务调用次数',
    //   dataIndex: 'callNo',
    //   sorter: true,
    //   align: 'right',
    //   render: val => `${val} 万`,
    //   // mark to display a total number
    //   needTotal: true,
    // },
    {
      title: '注册时间',
      dataIndex: 'createTime',
      sorter: true,
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.handleUpdateModalVisible(true, record)}>查看详细</a>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'userManager/fetch',
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'userManager/fetch',
      payload: params,
    });
  };

  handleExportExcel = () => {
    const { userManager } = this.props;
    console.log(userManager.data.list);
    const option= {
      fileName : 'user',
      datas : [{
        sheetData:userManager.data.list,
        sheetName:'sheet',
        sheetFilter:['openId','nickname','username','gender','status','createTime'],
        sheetHeader:['用户标识','用户昵称','用户姓名','用户性别','使用状态','创建时间'],
      }],
    };
    const toExcel = new ExportJsonExcel(option); // new
    toExcel.saveExcel(); // 保存
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'userManager/fetch',
      payload: {},
    });
  };

  handleSelectRows = rows => {
    console.log(rows);
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const values = {
        ...fieldsValue,
        month: fieldsValue.month && fieldsValue.month.valueOf()&&moment(fieldsValue.month).format('YYYY-MM'),
      };
      this.setState({
        formValues: values,
      });
      dispatch({
        type: 'userManager/fetch',
        payload: values,
      });
    });
  };

  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      auditModalVisible: !!flag,
      stepFormValues: record || {},
    });
  };

  handleUserFormSubmit = (form,handleFormReset) => {
    const that = this;
    const { dispatch } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const values = {
        ...fieldsValue,
      };
      console.log(values);
      dispatch({
        type: 'userManager/update',
        payload: values,
        callback:()=>{
          that.setState({
            formValues: {},
            auditModalVisible: false,
          });
          handleFormReset();
        },
      });
    });
  };

  renderAdvancedForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }} className={styles.myRow}>
          <Col md={8} sm={24}>
            <FormItem label="用户标识">
              {getFieldDecorator('openId')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="用户昵称">
              {getFieldDecorator('nickname')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="用户姓名">
              {getFieldDecorator('username')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }} className={styles.myRow}>
          <Col md={8} sm={24}>
            <FormItem label="用户性别">
              {getFieldDecorator('gender', {
                initialValue: "0",
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">所有</Option>
                  <Option value="1">男</Option>
                  <Option value="2">女</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status', {
                initialValue: "0",
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">所有</Option>
                  <Option value="1">启用</Option>
                  <Option value="2">禁用</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="注册年月">
              {getFieldDecorator('month')(
                <MonthPicker style={{ width: '100%' }} placeholder="请输入" format={monthFormat} />
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleExportExcel}>
              导出Excel
            </Button>
          </div>
        </div>
      </Form>
    );
  }

  render() {
    const {
      userManager: { data },
      loading,
    } = this.props;

    const { selectedRows, auditModalVisible ,stepFormValues  } = this.state;

    return (
      <PageHeaderWrapper title="用户列表">
        <Card bordered={false}>
          <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>
          <div className={styles.tableList}>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              rowKey="openId"
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        {
          stepFormValues && Object.keys(stepFormValues).length ? (
            <AuditForm
              handleUpdateModalVisible={this.handleUpdateModalVisible}
              handleFormReset={this.handleFormReset}
              handleUserFormSubmit={this.handleUserFormSubmit}
              auditModalVisible={auditModalVisible}
              values={stepFormValues}
            />
          ) : null
        }

      </PageHeaderWrapper>
    );
  }
}
export default TableList;
