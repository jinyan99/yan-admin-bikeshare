import React from 'react'
import {Button,Card,Modal} from 'antd'

import {Editor} from 'react-draft-wysiwyg'
// 导入样式
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import draftjs from 'draftjs-to-html'

export default class RichText extends React.Component{

    state = {
        showRichText:false,
        // 编辑器中的内容
        editorContent: '',
        // 编辑器状态
        editorState: '',
    };
    // 清空内容
    handleClearContent = ()=>{
        this.setState({// 将状态置空
            editorState:''
        })
    }
    // 获取html文本
    handleGetText = ()=>{// 点击后应该出现弹框
        this.setState({
            showRichText:true
        })
    }
    // 内容发生改变时，获取编辑器中内容的
    onEditorChange = (editorContent) => {
        this.setState({
            editorContent,
        });
    };
    // 编辑器状态发生变化时执行的这个方法
    onEditorStateChange = (editorState) => {
        this.setState({// 存下新状态
            editorState
        });
    };

    render(){
        const { editorContent, editorState } = this.state;
        return (
            <div>
                <Card style={{marginTop:10}}>
                    <Button type="primary" onClick={this.handleClearContent}>清空内容</Button>
                    <Button type="primary" onClick={this.handleGetText}>获取HTML文本</Button>
                </Card>
                <Card title="富文本编辑器">
                    <Editor
                        editorState={editorState}
                        onContentStateChange={this.onEditorChange}
                        onEditorStateChange={this.onEditorStateChange}
                    />
                </Card>
                <Modal
                    title="富文本"
                    visible={this.state.showRichText}
                    onCancel={()=>{
                        this.setState({
                            showRichText:false
                        })
                    }}
                    footer={null}
                >
                    {// 可以直接将编辑器内容放到该draftjs函数中返回html标签
                    draftjs(this.state.editorContent)}
                </Modal>
            </div>
        );
    }
}