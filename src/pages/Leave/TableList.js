import React, { PureComponent, Fragment } from 'react';
import ExportJsonExcel from 'js-export-excel';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Button, Modal, Badge, DatePicker } from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './TableList.less';

const FormItem = Form.Item;
const MonthPicker = DatePicker.MonthPicker;
const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const monthFormat = 'YYYY-MM';
const statusMap = ['default', 'processing', 'success', 'error'];
const status = ['未审批', '通过', '不通过'];
const leaveType = ['事假', '婚假', '丧假', '产假', '年假', '调休', '病假'];

@Form.create()
class AuditForm extends PureComponent {
  constructor(props) {
    super(props);
    console.log(props.values);

    this.state = {
      formVals: {
        status: '0',
      },
    };

    this.formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
  }

  render() {
    const { auditModalVisible, handleUpdateModalVisible, handleAudit, values } = this.props;
    const { formVals } = this.state;
    const { form } = this.props;

    return (
      <Modal
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title="请假审批"
        visible={auditModalVisible}
        onCancel={() => handleUpdateModalVisible()}
        onOk={() => handleAudit(values, form)}
      >
        <div>
          <Row>
            <Col span={12}>请假标识：</Col>
            <Col span={12}>{values.id}</Col>
          </Row>
          <Row>
            <Col span={12}>用户标识：</Col>
            <Col span={12}>{values.openId}</Col>
          </Row>
          <Row>
            <Col span={12}>用户姓名：</Col>
            <Col span={12}>{values.username}</Col>
          </Row>
          <Row>
            <Col span={12}>请假类型：</Col>
            <Col span={12}>{leaveType[values.leaveType]}</Col>
          </Row>
          <Row>
            <Col span={12}>请假理由：</Col>
            <Col span={12}>{values.message}</Col>
          </Row>
          <Row>
            <Col span={12}>请假开始时间：</Col>
            <Col span={12}>{values.startTime}</Col>
          </Row>
          <Row>
            <Col span={12}>请假结束时间：</Col>
            <Col span={12}>{values.stopTime}</Col>
          </Row>
          <Row>
            <Col span={12}>请假申请时间：</Col>
            <Col span={12}>{values.createTime}</Col>
          </Row>
          <FormItem key="status" {...this.formLayout} label="请假审批">
            {form.getFieldDecorator('status', {
              initialValue: formVals.status,
            })(
              <Select style={{ width: '100%' }}>
                <Option value="0">未审批</Option>
                <Option value="1">通过</Option>
                <Option value="2">不通过</Option>
              </Select>
            )}
          </FormItem>
          ,
        </div>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ leave, loading }) => ({
  leave,
  loading: loading.models.leave,
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
      title: '用户标识（唯一）',
      dataIndex: 'openId',
    },
    {
      title: '用户姓名（可能重复）',
      dataIndex: 'username',
    },
    {
      title: '请假理由',
      dataIndex: 'message',
    },
    {
      title: '请假类型',
      dataIndex: 'leaveType',
      render(val) {
        return leaveType[val];
      },
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
      title: '状态',
      dataIndex: 'status',
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '请假申请时间',
      dataIndex: 'createTime',
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.handleUpdateModalVisible(true, record)}>审批</a>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    const params = {
      leaveType: -1,
      status: -1,
    };
    dispatch({
      type: 'leave/fetch',
      payload: params,
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
      type: 'leave/fetch',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'leave/fetch',
      payload: {},
    });
  };

  handleExportExcel = () => {
    const { leave } = this.props;
    console.log(leave.data.list);
    const list = leave.data.list;
    list.forEach((value, i) => {
      value.leaveType = leaveType[value.leaveType];
      value.status = status[value.status];
    });
    const option = {
      fileName: `请假记录`,
      datas: [
        {
          sheetData: leave.data.list,
          sheetName: 'sheet',
          sheetFilter: ['openId', 'username', 'leaveType', 'message', 'status', 'createTime'],
          sheetHeader: ['用户标示', '用户姓名', '请假类型', '请假理由', '审批状态', '请假时间'],
        },
      ],
    };
    const toExcel = new ExportJsonExcel(option); // new
    toExcel.saveExcel(); // 保存
  };

  handleRemove = () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;
    dispatch({
      type: 'leave/remove',
      payload: {
        key: selectedRows.map(row => row.key),
      },
      callback: () => {
        this.setState({
          selectedRows: [],
        });
      },
    });
  };

  handleSelectRows = rows => {
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
        month:
          fieldsValue.month &&
          fieldsValue.month.valueOf() &&
          moment(fieldsValue.month).format('YYYY-MM'),
      };
      console.log(values);
      this.setState({
        formValues: values,
      });
      dispatch({
        type: 'leave/fetch',
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
            <FormItem label="用户姓名">
              {getFieldDecorator('username')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="查询年月">
              {getFieldDecorator('month')(
                <MonthPicker style={{ width: '100%' }} placeholder="请输入" format={monthFormat} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }} className={styles.myRow}>
          <Col md={8} sm={24}>
            <FormItem label="请假类型">
              {getFieldDecorator('leaveType', {
                initialValue: '-1',
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="-1">所有</Option>
                  <Option value="0">事假</Option>
                  <Option value="1">婚假</Option>
                  <Option value="2">丧假</Option>
                  <Option value="3">产假</Option>
                  <Option value="4">年假</Option>
                  <Option value="5">调休</Option>
                  <Option value="6">病假</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="审批状态">
              {getFieldDecorator('status', {
                initialValue: '-1',
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="-1">所有</Option>
                  <Option value="0">未审核</Option>
                  <Option value="1">通过</Option>
                  <Option value="2">未通过</Option>
                </Select>
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

  handleAudit = (rowData, form) => {
    const { dispatch } = this.props;
    const that = this;
    form.validateFields((err, values) => {
      if (!err) {
        console.log(rowData.id);
        console.log(values.status);
        dispatch({
          type: 'leave/update',
          payload: {
            id: rowData.id,
            status: values.status,
          },
          callback: () => {
            that.setState({
              auditModalVisible: false,
            });
          },
        });
      }
    });
  };

  render() {
    const {
      leave: { data },
      loading,
    } = this.props;

    const { selectedRows, auditModalVisible, stepFormValues } = this.state;

    return (
      <PageHeaderWrapper title="请假列表">
        <Card bordered={false}>
          <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>
          <div className={styles.tableList}>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              rowKey="id"
              columns={this.columns}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        {stepFormValues && Object.keys(stepFormValues).length ? (
          <AuditForm
            handleUpdateModalVisible={this.handleUpdateModalVisible}
            handleAudit={this.handleAudit}
            auditModalVisible={auditModalVisible}
            values={stepFormValues}
          />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}
export default TableList;
