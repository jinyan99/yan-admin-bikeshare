import React from 'react'
import { Card } from 'antd'
// 导入主题
import echartTheme from '../echartTheme'

// ==== 全部加载方式
// import echarts from 'echarts'

// ==== 按需加载方式
// 引入 ECharts 主模块
import echarts from 'echarts/lib/echarts'
// 引入饼图和折线图
import 'echarts/lib/chart/bar'
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/markPoint';

// 主要用于echarts react组件化开发，避免new实例化
import ReactEcharts from 'echarts-for-react';


export default class Bar extends React.Component {

    state={}

    componentWillMount(){
      // 应该提前在willmount中注入进去 注入主题
        echarts.registerTheme('Jinyan',echartTheme);
    }

    getOption(){
        let option = {
            title: {
                text: '用户骑行订单'
            },
            tooltip : {// 当移入时提示x轴数据值
                trigger: 'axis'
            },
            xAxis: {
                data: [
                    '周一',
                    '周二',
                    '周三',
                    '周四',
                    '周五',
                    '周六',
                    '周日'
                ]
            },
            yAxis: {
                type: 'value'
            },
            series: [// 是核心数据源
                {
                    name: '订单量',
                    type: 'bar',
                    data: [
                        1000,
                        2000,
                        1500,
                        3000,
                        2000,
                        1200,
                        800
                    ]
                }
            ]
        }
        return option;
    }

    getOption2(){
        let option = {
            title: {
                text: '用户骑行订单'
            },
            tooltip : {
                trigger: 'axis'
            },
            legend:{// 这是副标题功能，点击副标题可以过滤功能
                data:['OFO','摩拜','小蓝']
            },
            xAxis: {
                data: [
                    '周一',
                    '周二',
                    '周三',
                    '周四',
                    '周五',
                    '周六',
                    '周日'
                ]
            },
            yAxis: {
                type: 'value'
            },
            series: [// 核心数据源  3个订单量加载出来进行对比
                {
                    name: 'OFO',
                    type: 'bar',
                    data: [
                        2000,
                        3000,
                        5500,
                        7000,
                        8000,
                        12000,
                        20000
                    ]
                },
                {
                    name: '摩拜',
                    type: 'bar',
                    data: [
                        1500,
                        3000,
                        4500,
                        6000,
                        8000,
                        10000,
                        15000
                    ]
                },
                {
                    name: '小蓝',
                    type: 'bar',
                    data: [
                        1000,
                        2000,
                        2500,
                        4000,
                        6000,
                        7000,
                        8000
                    ]
                },
            ]
        }
        return option;
    }

    render(){
        return (
            <div>
                <Card title="柱形图表之一">
                    <ReactEcharts option={this.getOption()} theme="Jinyan" notMerge={true} lazyUpdate={true} style={{ height: 500 }} />
                </Card>
                <Card title="柱形图表之二" style={{marginTop:10}}>
                    <ReactEcharts option={this.getOption2()} theme="Jinyan" notMerge={true} lazyUpdate={true} style={{ height: 500 }} />
                </Card>
            </div> 
        );
    }
}