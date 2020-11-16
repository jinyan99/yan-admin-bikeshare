import React from 'react';
import { Card } from 'antd'
import axios from '../../axios'
import './detail.less'
export default class Order extends React.Component {

    state = {}

    componentDidMount(){
        let orderId = this.props.match.params.orderId;
        if(orderId){
            this.getDetailInfo(orderId);
        }
    }
    // 接口获取订单详情基础信息
    getDetailInfo = (orderId)=>{
        axios.ajax({
            url:'/order/detail',
            data:{
                params:{
                    orderId: orderId
                }
            }
        }).then((res)=>{
            if(res.code ==0){
                this.setState({
                    orderInfo:res.result
                })
                // 开始绘制地图
                this.renderMap(res.result);
            }
        })
    }
    // 初始化地图
    renderMap = (result)=>{
      // 参数是id，放到jsx中标签相关id里的
        this.map = new window.BMap.Map('orderDetailMap');
        // 设置地图的中心坐标点
        // this.map.centerAndZoom('北京',11);

        // 1添加地图控件
        this.addMapControl();
        // 2调用路线图绘制方法--用positionlist数据
        this.drawBikeRoute(result.position_list);
        // 3调用服务区绘制方法--用area的数据
        this.drwaServiceArea(result.area);
    }

    // 1 添加地图控件
    addMapControl = ()=>{
      // 先拿到地图对象
      let map = this.map;
      // 然后添加控件的方法------注意script中引入的全局变量都得用window.前缀
      map.addControl(new window.BMap.ScaleControl({ anchor: window.BMAP_ANCHOR_TOP_RIGHT}));// 缩放控件 配 停靠位置
      map.addControl(new window.BMap.NavigationControl({ anchor: window.BMAP_ANCHOR_TOP_RIGHT }));// 导航控件 配位置
    }

    // 2 绘制用户的行驶路线
    drawBikeRoute = (positionList)=>{
      // positionList是对象型数组都是包括用户的一系列的坐标点[{lon:经度坐标, lat:纬度坐标},...]，我们需要遍历这个数组去绘制坐标路线
        let map = this.map;// 拿到map对象
        let startPoint = '';// 起始坐标点
        let endPoint = '';// 终点坐标点

        if (positionList.length>0){
            let first = positionList[0];
            let last = positionList[positionList.length-1];

            // 2-1 ==== 计算出地图的起始坐标点--赋值给startPoint
            startPoint = new window.BMap.Point(first.lon,first.lat);
            // 给起点加上图标Icon------2参是Icon位置的空间的大小，3参是设定的图片的大小
            let startIcon = new window.BMap.Icon('/assets/start_point.png',new window.BMap.Size(36,42),{
                imageSize:new window.BMap.Size(36,42),// 图片大小
                anchor: new window.BMap.Size(18, 42)// 停靠的位置
            })
            // 上面定义的icon不能直接依赖到地图里去，得借助Marker来组合坐标点和坐标图标，然后直接往地图中插入这个marker即可显示在地图上了
            let startMarker = new window.BMap.Marker(startPoint, { icon: startIcon});
            this.map.addOverlay(startMarker);

            // 2-2 ==== 计算出终点坐标并插入到地图中显示
            endPoint = new window.BMap.Point(last.lon, last.lat);
            let endIcon = new window.BMap.Icon('/assets/end_point.png', new window.BMap.Size(36, 42), {
                imageSize: new window.BMap.Size(36, 42),
                anchor: new window.BMap.Size(18, 42)
            })
            let endMarker = new window.BMap.Marker(endPoint, { icon: endIcon });
            this.map.addOverlay(endMarker);

            // 2-3 连接路线图: 不能直接起点终点直接连一条线 得后端返回的数组里所有中间点都连起来
            let trackPoint = [];//需要先声明个跟踪点的数组
            for(let i=0;i<positionList.length;i++){
                let point = positionList[i];
                trackPoint.push(new window.BMap.Point(point.lon, point.lat));
            }
            // BMap.Polyline(增加折线功能) 可以把我们数组里的所有点都连起来，练成折线,但是还没闭合
            let polyline = new window.BMap.Polyline(trackPoint,{
                strokeColor:'#1869AD',//折线颜色
                strokeWeight:3,//折线宽度
                strokeOpacity:1//折线透明度
            })
            this.map.addOverlay(polyline);// 将折线添加到地图上
            this.map.centerAndZoom(endPoint, 11);// 将用户的终点当作我们地图可视区域的中心
        }
        
    }

    // 3 绘制服务区 (服务区是个多边形的)
    drwaServiceArea = (positionList)=>{
        // 3-1 连接路线图 (画多边形一样需要把坐标点添加进去)
        let trackPoint = [];
        for (let i = 0; i < positionList.length; i++) {
            let point = positionList[i];
            trackPoint.push(new window.BMap.Point(point.lon, point.lat));
        }
        // 3-2 绘制服务区 (Polygon是多边形，用进来的多个位置坐标练成多边形)
        let polygon = new window.BMap.Polygon(trackPoint, {
            strokeColor: '#CE0000',//红色
            strokeWeight: 4,//宽度
            strokeOpacity: 1,//透明度
            fillColor: '#ff8605',//填充的颜色
            fillOpacity:0.4//填充颜色透明度
        })
        this.map.addOverlay(polygon);
    }

    render(){
        const info = this.state.orderInfo || {};
        return (
            <div>
                <Card>
                    <div id="orderDetailMap" className="order-map"></div>
                    <div className="detail-items">
                        <div className="item-title">基础信息</div>
                        <ul className="detail-form">
                            <li>
                                <div className="detail-form-left">用车模式</div>
                                <div className="detail-form-content">{info.mode == 1 ?'服务区':'停车点'}</div>
                            </li>
                            <li>
                                <div className="detail-form-left">订单编号</div>
                                <div className="detail-form-content">{info.order_sn}</div>
                            </li>
                            <li>
                                <div className="detail-form-left">车辆编号</div>
                                <div className="detail-form-content">{info.bike_sn}</div>
                            </li>
                            <li>
                                <div className="detail-form-left">用户姓名</div>
                                <div className="detail-form-content">{info.user_name}</div>
                            </li>
                            <li>
                                <div className="detail-form-left">手机号码</div>
                                <div className="detail-form-content">{info.mobile}</div>
                            </li>
                        </ul>
                    </div>
                    <div className="detail-items">
                        <div className="item-title">行驶轨迹</div>
                        <ul className="detail-form">
                            <li>
                                <div className="detail-form-left">行程起点</div>
                                <div className="detail-form-content">{info.start_location}</div>
                            </li>
                            <li>
                                <div className="detail-form-left">行程终点</div>
                                <div className="detail-form-content">{info.end_location}</div>
                            </li>
                            <li>
                                <div className="detail-form-left">行驶里程</div>
                                <div className="detail-form-content">{info.distance/1000}公里</div>
                            </li>
                        </ul>
                    </div>
                </Card>
            </div>
        );
    }
}