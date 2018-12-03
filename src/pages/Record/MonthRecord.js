import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Card,
  Form,
  Modal,
  Row,
  Col,
  Upload,
  Icon,
  message,
  Avatar, Input, Button, DatePicker, Select
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { downloadMonthRecordExcelUrl,uploadMonthRecordExcelUrl } from '@/services/api';

import ExportJsonExcel from "js-export-excel";
import styles from './MonthRecord.less';

const FormItem = Form.Item;
const MonthPicker = DatePicker.MonthPicker;
const { Option } = Select;

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const monthFormat = 'YYYY-MM';

@Form.create()
class UpdateForm extends PureComponent {
  constructor(props) {
    super(props);
    console.log(props.values);

    this.formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
  }

  render() {
    const { updateModalVisible, handleUpdateModalVisible ,handleFormReset,handleFormSubmit ,values,form } = this.props;

    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Modal
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title={<div>创建时间：{values.createTime}</div>}
        visible={updateModalVisible}
        onCancel={() => handleUpdateModalVisible()}
        onOk={() => handleFormSubmit(form,handleFormReset)}
      >
        <div>

          <Form>
            <FormItem label="月打卡标识" {...this.formLayout}>
              {getFieldDecorator('id', {
                rules: [{ required: true, message: '请输入月打卡标识' }],
                initialValue: values.id,
              })(<Input placeholder="请输入" disabled />)}
            </FormItem>
            <FormItem label="用户标识" {...this.formLayout}>
              {getFieldDecorator('openId', {
                rules: [{ required: true, message: '请输入用户标识' }],
                initialValue: values.openId,
              })(<Input placeholder="请输入" disabled />)}
            </FormItem>
            <FormItem label="用户姓名" {...this.formLayout}>
              {getFieldDecorator('userName', {
                rules: [{ required: true, message: '请输入用户姓名' }],
                initialValue: values.userName,
              })(<Input placeholder="请输入" disabled />)}
            </FormItem>
            <FormItem label="应到天数" {...this.formLayout}>
              {getFieldDecorator('shouldNum', {
                rules: [{ required: true, message: '请输入应到天数' }],
                initialValue: values.shouldNum,
              })(<Input placeholder="请输入" />)}
            </FormItem>
            <FormItem label="实到天数" {...this.formLayout}>
              {getFieldDecorator('truedNum', {
                rules: [{ required: true, message: '请输入实到天数' }],
                initialValue: values.truedNum,
              })(<Input placeholder="请输入" />)}
            </FormItem>
            <FormItem label="请假天数" {...this.formLayout}>
              {getFieldDecorator('leaveNum', {
                rules: [{ required: true, message: '请输入请假天数' }],
                initialValue: values.leaveNum,
              })(<Input placeholder="请输入" />)}
            </FormItem>
            <FormItem label="缺勤天数" {...this.formLayout}>
              {getFieldDecorator('absenceNum', {
                rules: [{ required: true, message: '请输入缺勤天数' }],
                initialValue: values.absenceNum,
              })(<Input placeholder="请输入" />)}
            </FormItem>
            <FormItem label="考勤年月" {...this.formLayout}>
              {getFieldDecorator('forDate', {
                rules: [{ required: true, message: '请输入考勤年月' }],
              })(<MonthPicker style={{ width: '100%' }} format="YYYY-MM" />)}
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ monthRecord, loading }) => ({
  monthRecord,
  loading: loading.models.monthRecord,
}))
@Form.create()
class MonthRecord extends PureComponent {
  state = {
    updateModalVisible: false,
    selectedRows: [],
    formValues: {},
    stepFormValues: {},
  };

  columns = [
    {
      title: '用户标识',
      dataIndex: 'openId',
    },
    {
      title: '用户姓名',
      dataIndex: 'userName',
    },
    {
      title: '应到天数',
      dataIndex: 'shouldNum',
      render: val => `${val} 天`,
    },
    {
      title: '实到天数',
      dataIndex: 'truedNum',
      render: val => `${val} 天`,
    },
    {
      title: '请假天数',
      dataIndex: 'leaveNum',
      render: val => `${val} 天`,
    },
    {
      title: '缺勤天数',
      dataIndex: 'absenceNum',
      render: val => `${val} 天`,
    },
    {
      title: '考勤年月',
      dataIndex: 'forDate',
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
      type: 'monthRecord/fetch',
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
      type: 'monthRecord/fetch',
      payload: params,
    });
  };

  handleExportExcel = () => {
    const { monthRecord } = this.props;
    console.log(monthRecord.data.list);
    const option= {
      fileName : '考勤月打卡记录',
      datas : [{
        sheetData:monthRecord.data.list,
        sheetName:'考勤月打卡记录',
        sheetFilter:['id','openId','userName','shouldNum','truedNum','leaveNum','absenceNum','forDate','createTime'],
        sheetHeader:['月打卡标识','用户标识','用户姓名','应到天数','实到天数','请假天数','缺勤天数','考勤月份','创建时间'],
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
      type: 'monthRecord/fetch',
      payload: {},
    });
  };

  handleSelectRows = rows => {
    console.log(rows);
    this.setState({
      selectedRows: rows,
    });
  };

  handleRemove = () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    if (!selectedRows) return;
    dispatch({
      type: 'monthRecord/remove',
      payload: {
        key: selectedRows.map(row => row.id),
      },
      callback: (res) => {
        if(res.status === 200){
          message.success('删除成功');
        }else{
          message.error('删除失败');
        }
        this.setState({
          selectedRows: [],
        });
      },
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
        type: 'monthRecord/fetch',
        payload: values,
      });
    });
  };

  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      updateModalVisible: !!flag,
      stepFormValues: record || {},
    });
  };

  handleFormSubmit = (form,handleFormReset) => {
    const that = this;
    const { dispatch,monthRecord } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const values = {
        ...fieldsValue,
      };
      dispatch({
        type: 'monthRecord/update',
        payload: values,
        callback:(res)=>{
          if(res.status === 200){
            message.success('修改成功');
          }else{
            message.error('修改失败');
          }
          that.setState({
            formValues: {},
            updateModalVisible: false,
          });
          handleFormReset();
        },
      });
    });
  };

  renderAdvancedForm() {
    const {
      form: { getFieldDecorator },
      dispatch
    } = this.props;
    const props = {
      name: 'file',
      action: uploadMonthRecordExcelUrl,
      onChange(info) {
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          message.success(`${info.file.name} 上传成功`);
          dispatch({
            type: 'monthRecord/fetch',
          });
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} 上传失败`);
        }
      },
    };
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
              {getFieldDecorator('username')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="考勤年月">
              {getFieldDecorator('month')(
                <MonthPicker style={{ width: '100%' }} placeholder="请输入" format={monthFormat} />
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <Button className={styles.submitButtons} type="danger" onClick={this.handleRemove}>删除</Button>
          <Button href={downloadMonthRecordExcelUrl} className={styles.submitButtons} style={{ marginLeft: 8 }}>下载模板</Button>
          <Upload {...props} className={styles.submitButtons} style={{ marginLeft: 8 }}>
            <Button>
              <Icon type="upload" /> 上传数据
            </Button>
          </Upload>
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
      monthRecord: { data },
      loading,
    } = this.props;

    const { selectedRows, updateModalVisible ,stepFormValues  } = this.state;

    return (
      <PageHeaderWrapper title="月打卡列表">
        <Card bordered={false}>
          <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>
          <div className={styles.tableList}>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              rowKey="id"
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        {
          stepFormValues && Object.keys(stepFormValues).length ? (
            <UpdateForm
              handleUpdateModalVisible={this.handleUpdateModalVisible}
              handleFormReset={this.handleFormReset}
              handleFormSubmit={this.handleFormSubmit}
              updateModalVisible={updateModalVisible}
              values={stepFormValues}
            />
          ) : null
        }

      </PageHeaderWrapper>
    );
  }
}
export default MonthRecord;
