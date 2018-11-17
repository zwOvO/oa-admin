import React, { PureComponent, Fragment } from 'react';
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
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './TableList.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const status = ['未使用', '已使用'];

@Form.create()
class AuditForm extends PureComponent {
  constructor(props) {
    super(props);
    // this.state = {
    //   formVals: {
    //     status: '0',
    //   },
    // };

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
        title="授权码信息"
        visible={auditModalVisible}
        onCancel={() => handleUpdateModalVisible()}
        // onOk={() => handleAudit(values,form)}
      >
        <div>
          <Row>
            <Col span={12}>授权码：</Col>
            <Col span={12}>{values.license}</Col>
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
            <Col span={12}>使用情况：</Col>
            <Col span={12}>{status[values.status]}</Col>
          </Row>
          <Row>
            <Col span={12}>创建时间：</Col>
            <Col span={12}>{moment(values.createTime).format('YYYY-MM-DD HH:mm:ss')}</Col>
          </Row>
        </div>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ license, loading }) => ({
  license,
  loading: loading.models.license,
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
      title: '授权码',
      dataIndex: 'license',
    },
    {
      title: '用户姓名',
      dataIndex: 'username',
    },
    {
      title: '使用情况',
      dataIndex: 'status',
      render(val) {
        return status[val];
      },
    },
    {
      title: '创建时间',
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
    console.log('license/fetch');
    dispatch({
      type: 'license/fetch',
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
      type: 'license/fetch',
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
      type: 'license/fetch',
      payload: {},
    });
  };

  handleAdd = () => {
    const { dispatch } = this.props;
    console.log('license/add');
    dispatch({
      type: 'license/add',
      payload: {},
    });
  };

  handleRemove = () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    console.log('license/remove');
    if (!selectedRows) return;
    dispatch({
      type: 'license/remove',
      payload: {
        key: selectedRows.map(row => row.license),
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
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };
      this.setState({
        formValues: values,
      });
      dispatch({
        type: 'license/fetch',
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
          type: 'license/update',
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

  render() {
    const {
      license: { data },
      loading,
    } = this.props;

    const { selectedRows, auditModalVisible, stepFormValues } = this.state;

    return (
      <PageHeaderWrapper title="授权码列表">
        <Card bordered={false}>
          <Button className={styles.submitButtons} type="primary" onClick={this.handleAdd}>生成</Button>
          <Button className={styles.submitButtons} type="danger" onClick={this.handleRemove}>删除</Button>
          <div className={styles.tableList}>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              rowKey="license"
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
              // handleAudit={this.handleAudit}
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
