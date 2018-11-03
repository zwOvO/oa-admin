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
  Divider,
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
const statusMap = ['default', 'processing', 'success', 'error'];
const status = ['未审批', '通过', '不通过'];

@Form.create()
class AuditForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      formVals: {
        target: '0',
      },
    };

    this.formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
  }

  render() {
    const { auditModalVisible, handleUpdateModalVisible } = this.props;
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
      >
        <FormItem key="target" {...this.formLayout} label="请假审批">
          {form.getFieldDecorator('target', {
            initialValue: formVals.target,
          })(
            <Select style={{ width: '100%' }}>
              <Option value="0">未审批</Option>
              <Option value="1">通过</Option>
              <Option value="2">不通过</Option>
            </Select>
          )}
        </FormItem>,
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
  };

  columns = [
    {
      title: '用户标识',
      dataIndex: 'openId',
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
      filters: [
        {
          text: status[0],
          value: 0,
        },
        {
          text: status[1],
          value: 1,
        },
        {
          text: status[2],
          value: 2,
        },
      ],
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '请假申请时间',
      dataIndex: 'createTime',
      sorter: true,
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      render: () => (
        <Fragment>
          <a onClick={() => this.handleUpdateModalVisible(true)}>审批</a>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'leave/fetch',
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
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };
      this.setState({
        formValues: values,
      });
      dispatch({
        type: 'leave/fetch',
        payload: values,
      });
    });
  };

  handleUpdateModalVisible = (flag) => {
    this.setState({
      auditModalVisible: !!flag,
    });
  };

  render() {
    const {
      leave: { data },
      loading,
    } = this.props;

    const { selectedRows, auditModalVisible } = this.state;

    return (
      <PageHeaderWrapper title="请假列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        {
          <AuditForm
            handleUpdateModalVisible={this.handleUpdateModalVisible}
            auditModalVisible={auditModalVisible}
          />
        }

      </PageHeaderWrapper>
    );
  }
}
export default TableList;
