import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Card,
  Form,
  Modal,
  Row,
  Col,
  Avatar
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './TableList.less';

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

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
    const { auditModalVisible, handleUpdateModalVisible,values } = this.props;

    return (
      <Modal
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title="详细信息"
        visible={auditModalVisible}
        onCancel={() => handleUpdateModalVisible()}
      >
        <div>
          <Row>
            <Col span={12}>用户标识：</Col>
            <Col span={12}>{values.openId}</Col>
          </Row>
          <Row>
            <Col span={12}>用户名：</Col>
            <Col span={12}>{values.nickname}</Col>
          </Row>
          <Row>
            <Col span={12}>姓名：</Col>
            <Col span={12}>{values.username}</Col>
          </Row>
          <Row>
            <Col span={12}>性别：</Col>
            <Col span={12}>{values.gender===1?'男':'女'}</Col>
          </Row>
          <Row>
            <Col span={12}>头像：</Col>
            <Col span={12}><Avatar src={values.avatar} /></Col>
          </Row>
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
      title: '昵称',
      dataIndex: 'nickname',
    },
    {
      title: '姓名',
      dataIndex: 'username',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      render: val => val===1?'男':'女',
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
      title: '用户注册时间',
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
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
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

  render() {
    const {
      userManager: { data },
      loading,
    } = this.props;

    const { selectedRows, auditModalVisible ,stepFormValues  } = this.state;

    return (
      <PageHeaderWrapper title="用户列表">
        <Card bordered={false}>
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
