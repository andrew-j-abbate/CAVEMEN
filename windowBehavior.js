window.onload = function() {
  loadFunction();
}
// Lines 12-35 were copied from codemirror-5.10/demo/xmlcomplete.html
function completeAfter(cm, pred) {
  var cur = cm.getCursor();
  if (!pred || pred()) setTimeout(function() {
    if (!cm.state.completionActive)
      cm.showHint({completeSingle: false});
  }, 100);
  return CodeMirror.Pass;
}

function completeIfAfterLt(cm) {
  return completeAfter(cm, function() {
    var cur = cm.getCursor();
    return cm.getRange(CodeMirror.Pos(cur.line, cur.ch - 1), cur) == "<";
  });
}

function completeIfInTag(cm) {
  return completeAfter(cm, function() {
    var tok = cm.getTokenAt(cm.getCursor());
    if (tok.type == "string" && (!/['"]/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length == 1)) return false;
    var inner = CodeMirror.innerMode(cm.getMode(), tok.state).state;
    return inner.tagName;
  });
}

function loadFunction() {
  theHumanToPrint        = {};
  theObjects             = {};
  theMovables            = [];
  var convertModule      = document.getElementById('convert');
  var convertFullContext = document.getElementById('convertToContext');
  var myMirror           = CodeMirror.fromTextArea(document.getElementById('xmlEntry'), {
    lineNumbers : true,
    lineWrapping: true,
    mode        : 'xml',
    extraKeys   : {
      "'<'"       : completeAfter,
      "'/'"       : completeIfAfterLt,
      "' '"       : completeIfInTag,
      "'='"       : completeIfInTag,
      "Ctrl-Space": "autocomplete"
    },
    // There are no autocomplete features yet, but they can be implemented by
    // instantiating the schemaInfo object and uncommenting the next line.
    // hintOptions : {schemaInfo: tags}
  }
);
  myMirror.setSize(1300, null);
  var declarations = document.getElementById('varDeclarations');
  var SALmodule    = document.getElementById('SALmodule');
  myMirror.setValue(
  `<?xml version="1.0" encoding="UTF-8"?>
<hes xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="cavemen-3.0.xsd">
    <environment>
      <entity name="Heart" quantity="1">
        <entity name="Chamber" quantity="3">
          <property name="DistalTipRelation" type="spatial" evolution="none">Lead.DistalTip</property>
        </entity>
      </entity>
      <entity name="PulseGenerator" quantity="1">
        <entity name="Port" quantity="3">
          <property name="ProximalTipRelation" type="spatial" evolution="human">Lead.ProximalTip</property>
          <entity name="SetScrew" quantity="1">
            <property name="Loosened" type="boolean" evolution="none"/>
          </entity>
        </entity>
      </entity>
      <entity name="Lead" quantity="3">
        <entity name="ProximalTip" quantity="1">
          <property name="PortRelation" type="spatial" evolution="human">PulseGenerator.Port</property>
        </entity>
        <entity name="DistalTip" quantity="1">
          <property name="ChamberRelation" type="spatial" evolution="none">Heart.Chamber</property>
        </entity>
      </entity>
  </environment>
  <human>
    <ability name="MovePulseGenerator" entity="PulseGenerator">
      <translate left="1" right="1"/>
      <position back="1" down="1" forth="1" up="1"/>
      <pitch forth="1" back="1"/>
      <roll left="1" right="1"/>
      <yaw left="1" right="1"/>
    </ability>
    <ability name="MoveLeadProximalTip" entity="Lead.ProximalTip">
      <translate left="1" right="1"/>
      <position back="1" down="1" forth="1" up="1"/>
      <pitch forth="1" back="1"/>
      <roll left="1" right="1"/>
      <yaw left="1" right="1"/>
    </ability>
    <ability-set name="OneLeadAndPulseGenerator">
      <ability-ref name="MoveLeadProximalTip" quantity="1"/>
      <ability-ref name="MovePulseGenerator" quantity="1"/>
    </ability-set>
  </human>
  <affordance name="ChamberPortConnectibility">
    <environment-input name="Loosened" equality-operator="equal-to">TRUE</environment-input>
    <environment-input name="ProximalTipRelation" quantity-operator="all" equality-operator="equal-to">disjoint_to</environment-input>
    <environment-input name="PortRelation" quantity-operator="all" equality-operator="equal-to" >disjoint_to</environment-input>
    <environment-input name="DistalTipRelation" quantity-operator="exactly-1" equality-operator="equal-to" >covering front_of</environment-input>
    <environment-input name="ChamberRelation" quantity-operator="exactly-1" equality-operator="equal-to">contained_within</environment-input>
    <human-input name="MovePulseGenerator" quantity-operator="at_least-1"/>
    <human-input name="MoveLeadProximalTip" quantity-operator="at_least-1">
      <yaw-left equality-operator="equal-to">1</yaw-left>
      <yaw-right equality-operator="equal-to">1</yaw-right>
      <pitch-back equality-operator="equal-to">1</pitch-back>
      <pitch-forth equality-operator="equal-to">1</pitch-forth>
    </human-input>
    <environment-output name="DistalTipRelation" quantity-operator="exactly-1" equality-operator="equal-to">covering front_of</environment-output>
    <environment-output name="ChamberRelation" quantity-operator="exactly-1" equality-operator="equal-to">contained_within</environment-output>
    <environment-output name="PortRelation" quantity-operator="exactly-1" equality-operator="equal-to">covering back_of</environment-output>
    <environment-output name="ProximalTipRelation" quantity-operator="exactly-1" equality-operator="equal-to">covering front_of</environment-output>
  </affordance>
</hes>`
);
  declarations.value          = '';
  SALmodule.value             = '';
  convertModule.disabled      = false;
  convertFullContext.disabled = true;
  defineBehavior(convertModule, convertFullContext, myMirror);
}

function defineBehavior(convertButton, convertFullContext, myMirror) {
  myMirror.on('change', changedXML);
  var content           = document.getElementById('translatorTextBoxes');
  var declarations      = document.getElementById('varDeclarations');
  var SALmodule         = document.getElementById('SALmodule');
  var context           = document.createElement('TEXTAREA');
  context.className     = 'textBox';
  context.id            = 'fullContextBox';
  context.placeholder   = 'Full SAL Context will be generated here';
  convertButton.onclick = function() {
    var xmlEntry        = myMirror.getValue();
    if (document.activeElement.nodeName!=='parsererror') {
      convertToSAL(xmlEntry);
      convertButton.disabled      = true;
      convertFullContext.disabled = false;
    }
  }
  convertFullContext.onclick = function() {
    if (SALmodule.id.value !== '');
        content.appendChild(context);
        writeContextName(context.id);
        context.value += declarations.value;
        context.value += SALmodule.value;
        context.value += newLine + theSpecDeclarations;
        writeModuleComposition(context.id);
        convertFullContext.disabled = true;
  }
  function changedXML() {
    declarations.value = '';
    SALmodule.value = '';
    context.value = '';
    convertButton.disabled = false;
    convertFullContext.disabled = true;
  }
}
function convertToSAL(xmlInput) {
  var cavemen  = xmlInput;
  if (window.ActiveXObject) {
      var doc = new ActiveXObject('Microsoft.XMLDOM');
      doc.async='false';
      doc.loadXML(cavemen);
  }
  else {
      var parser = new DOMParser();
      var doc    = parser.parseFromString(cavemen,'text/xml');
  }
  var theMeatOfTheModel = whatWasInThe(doc);
  printSALCodeUsing(theMeatOfTheModel);
}
