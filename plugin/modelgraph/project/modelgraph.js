/**
 * Created by taojingui on 2017/10/24.
 */



// 电网模型数据
var modelBean;

// Parses URL parameters. Supported parameters are:
// - lang=xy: Specifies the language of the user interface.
// - touch=1: Enables a touch-style user interface.
// - storage=local: Enables HTML5 local storage.
// - chrome=0: Chromeless mode.
var urlParams = (function (url) {
    var result = new Object();
    var idx = url.lastIndexOf('?');

    if (idx > 0) {
        var params = url.substring(idx + 1).split('&');

        for (var i = 0; i < params.length; i++) {
            idx = params[i].indexOf('=');

            if (idx > 0) {
                result[params[i].substring(0, idx)] = params[i].substring(idx + 1);
            }
        }
    }

    return result;
})(window.location.href);

// 加載电网模型图xml文件
var loadGraphXmlFile = function (editorUI, filepath) {
    var graph = editorUI.editor.graph;
    var req = mxUtils.load(filepath);
    if (filepath && filepath.length > 0 && req.request.status == 200) {
        var root = req.getDocumentElement();
        var dec = new mxCodec(root.ownerDocument);
        dec.decode(root, graph.getModel());
    }
    else {
        alert("尚未生成电网模型图");
    }
}

/**
 * 保存电网模型
 */
var saveModelGraph = function (editorUI, netId) {
    if (netId != null) {

        if (editorUI.editor.graph.isEditing()) {
            editorUI.editor.graph.stopEditing();
        }

        var xml = mxUtils.getXml(editorUI.editor.getGraphXml());
        try {
            if (xml.length > MAX_REQUEST_SIZE) {
                mxUtils.alert(mxResources.get('drawingTooLarge'));
                mxUtils.popup(xml);
                return;
            }

            // 检查所有线路的两个节点都连上节点
            if (!checkLine(editorUI)) {
                return;
            }

            // 检查所有元件的编码是否有重复
            if (!checkCode(editorUI)) {
                return;
            }

            // 检查所有属性是否存在空值
            if (!checkAttrValue(editorUI)) {
                return;
            }

            doAjax(commonurlStr + '/web/modelgraph/save','post',{
                    netId: netId,
                    modelBean: encodeURIComponent(JSON.stringify(modelBean)),
                    xml: encodeURIComponent(xml)
                },function(data){
               var result = data.data
                if (result.status == "success") {
                    alert("保存成功！");
                    // 保存成功后重新加载图和数据
                    refresh(editorUI, netId, result.filepath);
                }
                else {
                    alert("保存失败！" + result.message);
                }
            });

            editorUI.editor.setModified(false);

        }
        catch (e) {
            console.log(e);
            editorUI.editor.setStatus(mxUtils.htmlEntities(mxResources.get('errorSavingFile')));
        }
    }
};

// 刷新电网模型图
var refresh = function (editorUI, netId, filepath) {

    loadGraphXmlFile(editorUI, filepath);
    loadModelBean(netId);

}

/**
 * 加载电网模型数据
 * @param netId
 */
var loadModelBean = function (netId) {
    doAjax(commonurlStr + '/web/modelgraph/loadModelBean', 'get', {netId: netId}, function (data) {
            modelBean = data.data;
        }
    );
}

/**
 * 修改属性值
 * @param cellId
 * @param event
 */
var changeAttributeValue = function (editorUI, cellId, event) {

    // 修改modelBean中对应的属性值
    var attrName = $(event.target).attr("name");
    var value = $(event.target).val();

    if (!modelBean[cellId]) {
        modelBean[cellId] = new Object();
    }
    modelBean[cellId][attrName] = value;

    console.log(editorUI.editor.graph.getModel().getCell(cellId));

    if (attrName == 'lineType') {
        var cell = editorUI.editor.graph.getModel().getCell(cellId).lineType = value;
        editorUI.format.refresh();
    }

    if(attrName.indexOf("Name") > -1) {
        editorUI.editor.graph.getModel().getCell(cellId).value = value;
        //labelPosition=left
        console.log(editorUI.editor.graph.getSelectionCells());
        editorUI.editor.graph.setCellStyles(mxConstants.STYLE_LABEL_POSITION,mxConstants.ALIGN_LEFT,editorUI.editor.graph.getSelectionCells());
        editorUI.editor.graph.refresh();
    }


    // 修改完名称后修改浮动提示信息
    /*
     var graph = editor.graph;
     var cell = editor.graph.getModel().getCell(cellId);
     var cellValue = graph.getModel().getValue(cell);
     // Converts the value to an XML node
     if (!mxUtils.isNode(cellValue))
     {
     var doc = mxUtils.createXmlDocument();
     var obj = doc.createElement('object');
     obj.setAttribute('label', cellValue || '');
     cellValue = obj;
     }
     cellValue.setAttribute(mxResources.get(attrName), value);
     graph.getModel().setValue(cell, cellValue);
     */

}

/**
 * 获取电网模型属性编辑框的信息
 * @param type
 * @return
 */
var getAttributePanel = function (type) {
    var panels = [];
    if (type == "unit") {
        panels = [
            {
                name: '基础信息',
                fields: [
                    {
                        fieldId: 'unitCode',
                        fieldName: '机组编号',
                        fieldType: 'input',
                        unit: ''
                    },
                    {
                        fieldId: 'unitName',
                        fieldName: '机组名称',
                        fieldType: 'input',
                        unit: ''
                    }, /*{
                     fieldId : 'plant',
                     fieldName : '所属电厂',
                     fieldType : 'select',
                     selectOptions : [
                     {value:'1',text:'电厂1'},
                     {value:'2',text:'电厂2'},
                     {value:'3',text:'电厂3'},
                     {value:'4',text:'电厂4'}
                     ],
                     unit : ''
                     },*/ {
                        fieldId: 'unitTypeId',
                        fieldName: '机组类型',
                        fieldType: 'select',
                        selectOptions: [
                            {value: '101', text: '燃煤'},
                            {value: '102', text: '燃油'},
                            {value: '103', text: '燃气'},
                            {value: '104', text: '核电'},
                            {value: '201', text: '常规水电'},
                            {value: '202', text: '小水电'},
                            {value: '203', text: '风电'},
                            {value: '301', text: '燃气'},
                            {value: '302', text: '太阳能'},
                            {value: '303', text: '其他类型新能源'},
                            {value: '9', text: '其他'}
                        ],
                        unit: ''
                    },
                    /*{
                     fieldId : 'priceType',
                     fieldName : '报价类型',
                     fieldType : 'select',
                     selectOptions : [
                     {value:'1',text:'单一报价'},
                     {value:'2',text:'分段报价'}
                     ],
                     unit : ''
                     },*/
                    {
                        fieldId: 'maxCapacity',
                        fieldName: '额定容量',
                        fieldType: 'input',
                        unit: 'MWh'
                    }, {
                        fieldId: 'minCapacity',
                        fieldName: '最小技术出力',
                        fieldType: 'input',
                        unit: 'MWh'
                    }, {
                        fieldId: 'incrate',
                        fieldName: '上爬坡速率',
                        fieldType: 'input',
                        unit: ''
                    }, {
                        fieldId: 'avgcost',
                        fieldName: '平均发电成本',
                        fieldType: 'input',
                        unit: ''
                    }
                ]
            },
            /*{
             name : '性能信息',
             fields : [
             {
             fieldId : 'startCost',
             fieldName : '启动费用',
             fieldType : 'input',
             unit : ''
             },{
             fieldId : 'offCost',
             fieldName : '停机费用',
             fieldType : 'input',
             unit : ''
             },{
             fieldId : 'avgcost',
             fieldName : '平均发电成本',
             fieldType : 'input',
             unit : ''
             },{
             fieldId : 'minOnTime',
             fieldName : '最小运行时间',
             fieldType : 'input',
             unit : ''
             },{
             fieldId : 'maxOnTime',
             fieldName : '最大运行时间',
             fieldType : 'input',
             unit : ''
             },{
             fieldId : 'incrate',
             fieldName : '上爬坡速率',
             fieldType : 'input',
             unit : ''
             },{
             fieldId : 'decRate',
             fieldName : '下爬坡速率',
             fieldType : 'input',
             unit : ''
             }
             ]
             }
             */
        ];
    }
    else if (type == "user") {
        panels = [
            {
                name: '基础信息',
                fields: [
                    {
                        fieldId: 'userCode',
                        fieldName: '用户编号',
                        fieldType: 'input',
                        unit: ''
                    },
                    {
                        fieldId: 'userName',
                        fieldName: '用户名称',
                        fieldType: 'input',
                        unit: ''
                    }, {
                        fieldId: 'type',
                        fieldName: '用户类型',
                        fieldType: 'select',
                        selectOptions: [
                            {value: '1', text: '价格敏感型'},
                            {value: '2', text: '价格不敏感型'},
                            {value: '3', text: '非线性'}
                        ],
                        unit: ''
                    },
                    /*{
                     fieldId : 'priceType',
                     fieldName : '报价类型',
                     fieldType : 'select',
                     selectOptions : [
                     {value:'1',text:'单一报价'},
                     {value:'2',text:'分段报价'}
                     ],
                     unit : ''
                     },{
                     fieldId : 'priceTypeNum',
                     fieldName : '',
                     fieldType : 'input',
                     unit : '段'
                     },
                     {
                     fieldId : 'loadCurve',
                     fieldName : '负荷曲线',
                     fieldType : 'select',
                     selectOptions : [
                     {value:'1',text:'单一值'},
                     {value:'2',text:'负荷曲线'}
                     ],
                     unit : ''
                     }
                     */
                ]
            }
        ];
    }
    else if (type == "line") {
        panels = [
            {
                name: '基础信息',
                fields: [
                    {
                        fieldId: 'lineType',
                        fieldName: '连接线类型',
                        fieldType: 'select',
                        selectOptions: [
                            {value: 'line', text: '线路'},
                            {value: 'connectLine', text: '连接线'},
                        ],
                        unit: ''
                    },
                    {
                        fieldId: 'lineCode',
                        fieldName: '线路编号',
                        fieldType: 'input',
                        unit: ''
                    },
                    {
                        fieldId: 'lineName',
                        fieldName: '线路名称',
                        fieldType: 'input',
                        unit: ''
                    }, {
                        fieldId: 'voltage',
                        fieldName: '电压等级',
                        fieldType: 'input',
                        unit: ''
                    }, {
                        fieldId: 'r',
                        fieldName: '支路电阻标幺值',
                        fieldType: 'input',
                        unit: ''
                    }, {
                        fieldId: 'x',
                        fieldName: '支路电抗标幺值',
                        fieldType: 'input',
                        unit: ''
                    }, {
                        fieldId: 'bcs',
                        fieldName: '支路1/2充电电纳标幺值',
                        fieldType: 'input',
                        unit: ''
                    }, {
                        fieldId: 'transCapcity',
                        fieldName: '额定传输容量(MW)',
                        fieldType: 'input',
                        unit: ''
                    }
                ]
            },
            /*{
             name : '节点信息',
             fields : [
             {
             fieldId : 'beginPnodeCode',
             fieldName : '首节点编号',
             fieldType : 'input',
             unit : ''
             },{
             fieldId : 'beginPnodeName',
             fieldName : '首节点名称',
             fieldType : 'input',
             unit : ''
             },{
             fieldId : 'endPnodeCode',
             fieldName : '末节点编号',
             fieldType : 'input',
             unit : ''
             },{
             fieldId : 'endPnodeName',
             fieldName : '末节点名称',
             fieldType : 'input',
             unit : ''
             }
             ]
             }
             */
        ];
    }
    /*
     else if(type == "connectLine") { // 连接线
     panels = [
     {
     name : '连接线信息',
     fields : [
     {
     fieldId : 'pnodeCode',
     fieldName : '节点编号',
     fieldType : 'input',
     unit : ''
     },{
     fieldId : 'pnodeName',
     fieldName : '节点名称',
     fieldType : 'input',
     unit : ''
     }
     ]
     }
     ];
     }
     */

    return panels;
}

// 检查连接线是否两端都连接上其他节点
var checkLine = function (editorUI) {

    for (var cellId in editorUI.editor.graph.getModel().cells) {
        var cell = editorUI.editor.graph.getModel().cells[cellId];
        if (cell.style && cell.style.indexOf("edge") > -1) {
            if (!cell.source || !cell.target) {
                alert("线路存在未连接的节点，请检查是否连接正确");
                editorUI.editor.graph.selectCellForEvent(editorUI.editor.graph.getModel().getCell(cellId),mxEvent.CLICK);
                return false;
            }
        }
    }

    return true;
}

// 检查元件编号是否有重复
var checkCode = function (editorUI) {
    var codes = [];
    for (var cellId in editorUI.editor.graph.getModel().cells) {

        if(modelBean[cellId]) {
            var code;
            if (modelBean[cellId].unitCode) {
                code = modelBean[cellId].unitCode;
            }
            else if (modelBean[cellId].userCode) {
                code = modelBean[cellId].userCode;
            }
            else if (modelBean[cellId].lineCode) {
                code = modelBean[cellId].lineCode;
            }
            if (code && $.inArray(code, codes) > -1) {
                alert("存在重复编号，请修改编号");
                editorUI.editor.graph.selectCellForEvent(editorUI.editor.graph.getModel().getCell(cellId),mxEvent.CLICK);
                return false;
            }
            if(code){
                codes.push(code);
            }
        }

    }

    return true;
}

// 检查所有的属性是否存在空值
var checkAttrValue = function (editorUI) {
    for (var cellId in editorUI.editor.graph.getModel().cells) {
        for (var key in modelBean[cellId]) {
            if (key == 'subTypeId' || key == 'pnodeId' || key == 'pnodeCode') { // 忽略一些属性
                continue;
            }
            if (!modelBean[cellId][key] || $.trim(modelBean[cellId][key]).length == 0) {
                alert("属性存在空值，请填写完整");
                editorUI.editor.graph.selectCellForEvent(editorUI.editor.graph.getModel().getCell(cellId),mxEvent.CLICK);
                return false;
            }
        }
    }

    return true;
}