import React from 'react'
import {Card, Button, Form, Input, Select, Tree, Transfer, Modal} from 'antd'
import axios from '../../axios/index'
import ETable from '../../components/ETable/index'
import menuConfig from '../../config/menuConfig'
import Utils from '../../utils/utils'
const FormItem = Form.Item;
const Option = Select.Option;
const TreeNode = Tree.TreeNode;
export default class Order extends React.Component{

    state={}

    componentWillMount(){
        this.requestList();
    }

    requestList = ()=>{
        axios.ajax({
            url:'/role/list',
            data:{
                params:{}
            }
        }).then((res)=>{
            if(res.code == 0){
                let list  = res.result.item_list.map((item,i)=>{
                    item.key = i;
                    return item;
                })
                this.setState({
                    list
                })
            }
        })
    }

    // 角色创建---打开创建角色弹框
    handleRole = ()=>{
        this.setState({
            isRoleVisible:true
        })
    }

    // 角色提交
    handleRoleSubmit = ()=>{
        // 取到form表单的表单值
        let data = this.roleForm.props.form.getFieldsValue();
        axios.ajax({
            url:'role/create',
            data:{
                params:{
                    ...data
                }
            }
        }).then((res)=>{
            if(res){
                this.setState({
                    isRoleVisible:false
                })
                this.roleForm.props.form.resetFields();
                this.requestList();//重新刷新数据
            }
        })
    }

    // 设置权限
    handlePermission = ()=>{
        // 先判断当前有没有选中角色
        if (!this.state.selectedItem) {
            Modal.info({
                title: '信息',
                content: '请选择一个角色'
            })
            return;
        }
        this.setState({
            isPermVisible: true,// 开关值 把弹框弹出来
            detailInfo: this.state.selectedItem
        });
        let menuList = this.state.selectedItem.menus;
        this.setState({
            menuInfo:menuList
        })
    }
    // 设置权限的确定提交方法
    handlePermEditSubmit = ()=>{
        let data = this.roleForm.props.form.getFieldsValue();
        data.role_id = this.state.selectedItem.id;
        data.menus = this.state.menuInfo;

        axios.ajax({
            url:'/permission/edit',
            data:{
                params:{
                    ...data
                }
            }
        }).then((res)=>{
            if(res){
                this.setState({
                    isPermVisible:false
                })
                this.requestList();
            }
        })
    }

    // 用户授权
    handleUserAuth = ()=>{
        if (!this.state.selectedItem) {
            Modal.info({
                title: '信息',
                content: '未选中任何项目'
            })
            return;
        }
        this.getRoleUserList(this.state.selectedItem.id);//把角色名称id传进去获取该角色对应的用户列表
        this.setState({
            isUserVisible: true,//控制弹框是否显示
            isAuthClosed: false,//
            detailInfo: this.state.selectedItem
        });
    }
    getRoleUserList = (id)=>{// 角色全部用户列表请求
        axios.ajax({
            url:'/role/user_list',
            data:{
                params:{
                    id:id
                }
            }
        }).then((res)=>{
            if(res){
                this.getAuthUserList(res.result);
            }
        })
    }
    // 筛选目标用户
    getAuthUserList = (dataSource) => {// 筛选目标用户，接受数据源进行筛选
        const mockData = [];// 数据源
        const targetKeys = [];// 目标源--[string]类型，是用来存key就行的

        if (dataSource && dataSource.length) {
            for (let i = 0; i < dataSource.length; i++) {
                // 先声明一个data结构，必须和穿梭框组件的识别的数据结构保持一致
                const data = {
                    key: dataSource[i].user_id,//用户id
                    title: dataSource[i].user_name,//用户名
                    status: dataSource[i].status,//状态
                };
                // 状态为1则放到目标用户里，0和1状态是服务端数据返回的定义的结构
                if (data.status == 1) {
                    targetKeys.push(data.key);
                }
                //若为0则非目标用户
                mockData.push(data);
            }
        }
        this.setState({mockData, targetKeys});
    };
    // 更新targetKeys---打通单向流通
    patchUserInfo = (targetKeys) => {
        this.setState({
            targetKeys: targetKeys
        });
    };

    // 用户授权 点击提交
    handleUserSubmit = ()=>{
        let data = {};// 数据源--最后需要把数据源调接口存到该角色中用户数据库中

        data.user_ids = this.state.targetKeys || [];
        data.role_id = this.state.selectedItem.id;

        axios.ajax({
            url:'/role/user_role_edit',
            data:{
                params:{
                    ...data
                }
            }
        }).then((res)=>{
            if(res){
                this.setState({
                    isUserVisible:false
                })
                this.requestList();
            }
        })
    }
    render(){
        const columns = [
            {
                title: '角色ID',
                dataIndex: 'id'
            }, {
                title: '角色名称',
                dataIndex: 'role_name'
            },{
                title: '创建时间',
                dataIndex: 'create_time',
                render: Utils.formatTime
            }, {
                title: '使用状态',
                dataIndex: 'status',
                render(status){
                    if (status == 1) {
                        return "启用"
                    } else {
                        return "停用"
                    }
                }
            }, {
                title: '授权时间',
                dataIndex: 'authorize_time',
                render: Utils.formatTime
            }, {
                title: '授权人',
                dataIndex: 'authorize_user_name',
            }
        ];
        return (
            <div>
                <Card>
                    <Button type="primary" onClick={this.handleRole}>创建角色</Button>
                    <Button type="primary" onClick={this.handlePermission}>设置权限</Button>
                    <Button type="primary" onClick={this.handleUserAuth}>用户授权</Button>
                </Card>
                <div className="content-wrap">
                    <ETable
                        updateSelectedItem={Utils.updateSelectedItem.bind(this)}
                        selectedRowKeys={this.state.selectedRowKeys}
                        dataSource={this.state.list}
                        columns={columns}
                    />
                </div>
                <Modal
                    title="创建角色"
                    visible={this.state.isRoleVisible}
                    onOk={this.handleRoleSubmit}
                    onCancel={()=>{
                        this.roleForm.props.form.resetFields();
                        this.setState({
                            isRoleVisible:false
                        })
                    }}
                >
                    <RoleForm wrappedComponentRef={(inst) => this.roleForm = inst }/>
                </Modal>
                <Modal
                       title="权限设置"
                       visible={this.state.isPermVisible}
                       width={600}
                       onOk={this.handlePermEditSubmit}
                       onCancel={()=>{
                           this.setState({
                               isPermVisible:false
                           })
                       }}>
                        <PermEditForm
                            wrappedComponentRef={(inst) => this.roleForm = inst }
                            detailInfo={this.state.detailInfo}
                            menuInfo={this.state.menuInfo||[]}
                            patchMenuInfo={(checkedKeys)=>{
                              // 接受到用户自定义选的最新的checkedKeys，更新到其父组件当前组件的menuInfo中 接管处理
                                this.setState({
                                    menuInfo: checkedKeys
                                });
                            }}
                        />
                </Modal>
                <Modal
                       title="用户授权"
                       visible={this.state.isUserVisible}
                       width={800}
                       onOk={this.handleUserSubmit}
                       onCancel={()=>{
                           this.setState({
                               isUserVisible:false
                           })
                       }}>
                        <RoleAuthForm
                            wrappedComponentRef={(inst) => this.userAuthForm = inst }
                            isClosed={this.state.isAuthClosed}
                            detailInfo={this.state.detailInfo}
                            targetKeys={this.state.targetKeys}
                            mockData={this.state.mockData}
                            patchUserInfo={this.patchUserInfo}
                        />
                </Modal>
            </div>
        );
    }
}

// 角色创建--内部表单
class RoleForm extends React.Component{

    render(){
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {span: 5},
            wrapperCol: {span: 16}
        };
        return (
            <Form layout="horizontal">
                <FormItem label="角色名称" {...formItemLayout}>
                    {
                        getFieldDecorator('role_name',{
                            initialValue:''
                        })(
                            <Input type="text" placeholder="请输入角色名称"/>
                        )
                    }
                </FormItem>
                <FormItem label="状态" {...formItemLayout}>
                    {
                        getFieldDecorator('state',{
                            initialValue:1
                        })(
                        <Select>
                            <Option value={1}>开启</Option>
                            <Option value={0}>关闭</Option>
                        </Select>
                    )}
                </FormItem>
            </Form>
        );
    }
}
RoleForm = Form.create({})(RoleForm);


// 设置权限--内部表单
class PermEditForm extends React.Component {
    state = {};
    // 设置选中的节点，通过父组件方法再传递回来
    onCheck = (checkedKeys) => {
      // 这块是父组件的menuInfo来默认渲染各个节点，然后子组件改变了checkedKeys，再把最新值传给父组件
        this.props.patchMenuInfo(checkedKeys);
    };

    // 递归处理读取data列表
    renderTreeNodes = (data,key='') => {
        return data.map((item) => {
            let parentKey = key+item.key;
            if (item.children) {
                return (
                    <TreeNode title={item.title} key={parentKey} dataRef={item} className="op-role-tree">
                        {this.renderTreeNodes(item.children,parentKey)}
                    </TreeNode>
                );
            } else if (item.btnList) {
                return (
                    <TreeNode title={item.title} key={parentKey} dataRef={item} className="op-role-tree">
                        { this.renderBtnTreedNode(item,parentKey) }
                    </TreeNode>
                );
            }
            return <TreeNode {...item} />;
        });
    };

    renderBtnTreedNode = (menu,parentKey='')=> {
        const btnTreeNode = []
        menu.btnList.forEach((item)=> {
            console.log(parentKey+'-btn-'+item.key);
            btnTreeNode.push(<TreeNode title={item.title} key={parentKey+'-btn-'+item.key} className="op-role-tree"/>);
        })
        return btnTreeNode;
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {span: 5},
            wrapperCol: {span: 18}
        };
        const detail_info = this.props.detailInfo;
        const menuInfo = this.props.menuInfo;
        return (
            <Form layout="horizontal">
                <FormItem label="角色名称：" {...formItemLayout}>
                    <Input disabled maxLength="8" placeholder={detail_info.role_name}/>
                </FormItem>
                <FormItem label="状态：" {...formItemLayout}>
                    {getFieldDecorator('status',{
                        initialValue: '1'
                    })(
                        <Select style={{ width: 80}}
                                placeholder="启用"
                        >
                            <Option value="1">启用</Option>
                            <Option value="0">停用</Option>
                        </Select>
                    )}
                </FormItem>
                <Tree
                    checkable
                    defaultExpandAll
                    onCheck={(checkedKeys)=>this.onCheck(checkedKeys)}
                    checkedKeys={menuInfo ||[]}// 从menuInfo中默认展开的权限
                >
                    <TreeNode title="平台权限" key="platform_all">
                      {/* 这块是在menuConfig基础上往外套了个父节点--平台权限 */}
                        {this.renderTreeNodes(menuConfig)}
                    </TreeNode>
                </Tree>
            </Form>
        )
    }
}
PermEditForm = Form.create({})(PermEditForm);


// 用户授权--内部表单
class RoleAuthForm extends React.Component {

    filterOption = (inputValue, option) => {
        return option.title.indexOf(inputValue) > -1;
    };
    // 咱们这个targetKeys是由父组件传过来的，所以我们勾选数据穿梭时直接传是传不过去的，得手动借助onChage事件把targetKeys手动传到父组件中改变props值即可
    handleChange = (targetKeys) => {
        this.props.patchUserInfo(targetKeys);
    };

    render() {
        const formItemLayout = {
            labelCol: {span: 5},
            wrapperCol: {span: 18}
        };
        const detail_info = this.props.detailInfo;
        return (
            <Form layout="horizontal">
                <FormItem label="角色名称：" {...formItemLayout}>
                    <Input disabled maxLength={8} placeholder={detail_info.role_name}/>
                </FormItem>
                <FormItem label="选择用户：" {...formItemLayout}>
                    <Transfer
                        listStyle={{width: 200,height: 400}}
                        dataSource={this.props.mockData}
                        showSearch
                        titles={['待选用户', '已选用户']}
                        searchPlaceholder='输入用户名'
                        filterOption={this.filterOption}
                        targetKeys={this.props.targetKeys}
                        onChange={this.handleChange}// 通过onchage打通父组件props流向
                        render={item => item.title}// 每一行数据渲染的函数，不写他就不会显示标题
                    />
                </FormItem>
            </Form>
        )
    }
}
RoleAuthForm = Form.create({})(RoleAuthForm);