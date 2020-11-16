import React from 'react'
import { Menu, Icon } from 'antd';
import { NavLink } from 'react-router-dom'

import { connect } from 'react-redux'
import { switchMenu, saveBtnList } from './../../redux/action'

import MenuConfig from './../../config/menuConfig'
import './index.less';


const SubMenu = Menu.SubMenu;
class NavLeft extends React.Component {
    state = {
        currentKey: ''
    }
    // 菜单点击
    handleClick = ({ item, key }) => {
        if (key == this.state.currentKey) {
            return false;
        }
        // 事件派发，自动调用reducer，通过reducer保存到store对象中
        const { dispatch } = this.props;
        dispatch(switchMenu(item.props.title));

        this.setState({
            currentKey: key
        });
    };
    componentWillMount(){
      // @1 先在挂载时生命周期中渲染菜单列表赋值给状态数据原型，供在jsx渲染中用
        const menuTreeNode = this.renderMenu(MenuConfig);

        this.setState({
            menuTreeNode
        })
    }
    // @2 菜单渲染--- 用递归的方式渲染后端过来的菜单列表配置文件
    renderMenu =(data)=>{
        return data.map((item)=>{
            if(item.children){
                return (
                    <SubMenu title={item.title} key={item.key}>
                        { this.renderMenu(item.children)}
                    </SubMenu>
                )
            }
            return <Menu.Item title={item.title} key={item.key}>
                <NavLink to={item.key}>{item.title}</NavLink>
            </Menu.Item>
        })
    }
    homeHandleClick = () => {
        const { dispatch } = this.props;
        dispatch(switchMenu('首页'));
        this.setState({
            currentKey: ""
        });
    };
    render() {
        return (
            <div>
                <NavLink to="/home" onClick={this.homeHandleClick}>
                    <div className="logo">
                        <img src="/assets/logo-ant.svg" alt=""/>
                        <h1>yan-admin</h1>
                    </div>
                </NavLink>
                <Menu
                    selectedKeys={['/city']}
                    onClick={this.handleClick}
                    theme="dark"
                >
                    { this.state.menuTreeNode }
                </Menu>
            </div>
        );
    }
}
export default connect()(NavLeft)