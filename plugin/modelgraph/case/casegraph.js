/**
 * Created by taojingui on 2017/10/24.
 */



// 保存方案数据
var caseData = {};

// 保存电网元件的属性定义
var caseVarDef = {};


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
 * 获取电网元件的属性定义
 * @param caseId 方案ID
 */
var getCaseVarDef = function (caseId) {
    doAjax(commonurlStr +"/web/casegraph/getCaseVarDef",'get',{caseId:caseId},function (result) {
        console.log(result);
        caseVarDef = result;
    })
}

/**
 * 获取电网元件的方案数据
 * @param caseId 方案ID
 * @param powerModelId 元件ID
 * @param powerModelType 元件类型，机组/用户/线路
 */
var getCaseElementData = function (caseId, powerModelId, powerModelType) {
    var data;
    doAjax(commonurlStr +"/web/casegraph/getCaseElementData",'get',{
        caseId: caseId,
        powerModelId:powerModelId,
        powerModelType:powerModelType
    },function (result) {
        data = result;
    });
    return data;
}

/**
 * 保存方案数据
 */
var saveCaseData = function (editorUI) {
    // 检查所有属性是否存在空值
    if (!checkAttrValue(editorUI)) {
        return;
    }
    doAjax(commonurlStr+'/web/casegraph/saveCase','post',{
        caseId: $("#caseId").val(),
        caseData: encodeURIComponent(JSON.stringify(caseData))
    }, function (result) {
        if (result.status == "success") {
            alert("保存成功！");
        }
        else {
            alert("保存失败！" + result.message);
        }
    });
};

/**
 * 修改属性值
 * @param cellId
 * @param event
 */
var changeAttributeValue = function (cellId, event) {
    var attrName = $(event.target).attr("name");
    var value = $(event.target).val();
    caseData[cellId][attrName] = value;
}

// 检查所有的属性是否存在空值
var checkAttrValue = function (editorUI) {
    for (var cellId in caseData) {
        for (var key in caseData[cellId]) {
            if (key == 'subTypeId' || key == 'pnodeId' || key == 'pnodeCode') { // 忽略一些属性
                continue;
            }
            if (!caseData[cellId][key] || $.trim(caseData[cellId][key]).length == 0) {
                alert("属性存在空值，请填写完整");
                editorUI.editor.graph.selectCellForEvent(editorUI.editor.graph.getModel().getCell(cellId), mxEvent.CLICK);
                if(cellId != 'wholeSimulateParm') {
                    $("div[name='secondLevelLabel']")[1].click();  // 显示扩展信息面板
                }
                $("input[name='"+key+"']").focus();
                return false;
            }
        }
    }
    return true;
}
