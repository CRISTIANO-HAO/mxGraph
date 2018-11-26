# mxGraph 入门

## 准备

### 启动

```js
// 安装http-server
npm install
// 启动
npm run start
```

#### 引入mxGraph

```js
<script type =“text/javascript”>
  // 下载项目目录结构默认路径
  mxBasePath ='javascript/src';
  // 本项目路径
  mxBasePath ='/plugin/mxgraph';
</ script>
<script type =“text/javascript” src =“javascript/src/js/mxClient.js”> </ script>
```

`mxBasePath` 变量用于定义mxGraph库放置的路径。必须在加载库代码之前定义此变量，并且路径尾部可以不包含斜杠。


## 开始

#### 初始化一个`graph`实例
```js
// 方式一
var container = document.getElementById('root');
var graph = new mxGraph(container);

// 方式二
var model = new mxGraphModel();
var graph = new mxGraph(container, model);
```

#### mxGraph与mxGraphModel

`mxGraph`是核心类，其他类都是辅助类，如图：

![](https://jgraph.github.io/mxgraph/docs/images/graph.png)

通过`graph`实例可以获取到相关的辅助类的实例：

```js
// mxGraphModel
graph.getModel()
// mxStylesheet
graph.getStylesheet()
```

#### mxGraphModel与mxCell

The mxGraph model is the core model that **describes the structure of the graph**, the class is called mxGraphModel and is found within the model package.

`mxCell`是`mxGraphModel`的基本组成元素，`mxCell`有三种类型，分别是 `vertices`（点） , `edges`（线）,`groups`（组）

![](https://jgraph.github.io/mxgraph/docs/images/model.png)


The graph model has the following properties:

 - The root element of the graph contains the layers. The parent of each layer is the root element.
 - A layer may contain elements of the graph model, namely vertices, edges and groups.
 - Groups may contain elements of the graph model, recursively.

以上是官方文档对`mxGraph`,`mxGraphModel`,`mxCell`三者关系的描述，理解其中的关系有利于对整个库全面的认识，阅读官方文档的时候也更有针对性。


#### mxStylesheet
mxStylesheet defines the appearance of the cells in a graph.
```js
// 获取Vertex的默认样式
var vertexStyle = graph.getStylesheet().getDefaultVertexStyle();
// 获取edge的默认样式
var edgeStyle = graph.getStylesheet().getDefaultEdgeStyle();
```

自定义样式：
```js
var style = new Object();
style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
style[mxConstants.STYLE_ROUNDED] = true;

// 自定义样式
graph.getStylesheet().putCellStyle('rounded', style);

// 设置cell的样式
model.setStyle(cell, 'rounded');
```

#### mxConstants
mxConstants defines various global constants.

```js
mxConstants.STYLE_OVERFLOW === 'overflow'
mxConstants.DEFAULT_FONTFAMILY === 'Arial'
mxConstants.STYLE_STROKE_OPACITY === 'strokeOpacity'
```


## 核心API -- mxCell
前面已经谈到`mxCell`是组成graph的基本组成元素，针对mxCell的操作是官方文档的重点。

#### 插入cell
```js
// 启动新事务或子事务
graph.getModel().beginUpdate();
try
{
   // 插入vertex
   var v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
   var v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
   // 插入edge
   var e1 = graph.insertEdge(parent, null, '', v1, v2);
}
finally
{
   // 完成事务或子事务，更新视图
   graph.getModel().endUpdate();
}
```

#### 添加cell样式
```js
// ROUNDED为自定义样式
var v1 = graph.insertVertex(parent, null, 'Hello', 20, 20, 80, 30, 'ROUNDED');

// 添加混合样式
var v1 = graph.insertVertex(parent, null, 'Hello',  20, 20, 80, 30, 'ROUNDED;strokeColor=red;fillColor=green');
```

#### mxCell与mxGeometry
`geometry`是`cell`的一个属性，包含cell的几何信息：
```js
// 类似CSS的relative属性
v1.geometry.relative = true
// 设置偏移量
v1.geometry.offset = new mxPoint(0, 10)
```


## 核心API - mxEventSource
```js
new mxGraph instanceof mxEventSource // true
new mxGraphModel instanceof mxEventSource // true
```

`mxGraph`跟`mxGraphModel`都继承了`mxEventSource`，因此可以绑定监听事件：
```js
graph.click = function(me){
	console.log(me)
    // 触发事件
    model.fireEvent(new mxEventObject(mxEvent.CLICK))
}
// 绑定事件
model.addListener(mxEvent.CLICK, function(sender, evt){
  console.log(evt)
});
```


