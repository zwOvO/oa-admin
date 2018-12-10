import React, { PureComponent, Fragment } from 'react';
import ExportJsonExcel from 'js-export-excel'
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Button,
  Modal,
  Badge,
  DatePicker,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './TableList.less';

const FormItem = Form.Item;
const MonthPicker = DatePicker.MonthPicker;

const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key]);

const monthFormat = 'YYYY-MM';

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
    const { form } = this.props;

    return (
      <Modal
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title="打卡记录"
        visible={auditModalVisible}
        onCancel={() => handleUpdateModalVisible()}
        onOk={() => handleUpdateModalVisible()}
      >
        <div>
          <Row>
            <Col span={12}>打卡标识：</Col>
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
            <Col span={12}>打卡时间：</Col>
            <Col span={12}>{values.createTime}</Col>
          </Row>
        </div>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ record, loading }) => ({
  record,
  loading: loading.models.record,
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
      title: '打卡标识',
      dataIndex: 'id',
    },
    {
      title: '用户标识（唯一）',
      dataIndex: 'openId',
    },
    {
      title: '用户姓名（可能同名）',
      dataIndex: 'username',
    },
    {
      title: '打卡时间',
      dataIndex: 'createTime',
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
      type: 'record/fetch',
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
      type: 'record/fetch',
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
      type: 'record/fetch',
      payload: {},
    });
  };

  handleExportExcel = () => {
    const { record } = this.props;
    console.log(record.data.list);
    const option= {
      fileName : 'excel',
      datas : [{
        sheetData:record.data.list,
        sheetName:'sheet',
        sheetFilter:['openId','username','createTime'],
        sheetHeader:['用户标示','用户姓名','打卡时间']
      }],
    };
    const toExcel = new ExportJsonExcel(option); // new
    toExcel.saveExcel(); // 保存
  };

  handleRemove = () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;
    dispatch({
      type: 'record/remove',
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
        month: fieldsValue.month && fieldsValue.month.valueOf()&&moment(fieldsValue.month).format('YYYY-MM'),
      };
      console.log(values);
      this.setState({
        formValues: values,
      });
      dispatch({
        type: 'record/fetch',
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

  handleAudit = (rowData,form) => {
    const { dispatch } = this.props;
    const that = this;
    form.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'record/update',
          payload: {
            id:rowData.id,
            status:values.status,
          },
          callback:()=>{
            that.setState({
              auditModalVisible:false,
            });
          }
        });
      }
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
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }} className={styles.myRow}>
          <Col md={8} sm={24}>
            <FormItem label="查询年月">
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
      record: { data },
      loading,
    } = this.props;

    const { selectedRows, auditModalVisible, stepFormValues } = this.state;

    return (
      <PageHeaderWrapper title="打卡列表">
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
            <AuditForm
              handleUpdateModalVisible={this.handleUpdateModalVisible}
              handleAudit={this.handleAudit}
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
