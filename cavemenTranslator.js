function whatWasInThe(cavemenXML) {
  captureClonedRecords(cavemenXML.children[0], cavemenXML, 0);
  getTheClonedSpatialProperties(cavemenXML.children[0], cavemenXML);
  captureQuantitySpecifications(cavemenXML.children[0], cavemenXML, []);
  setTheClonedAbilitySets(cavemenXML);
  getAllTheProperties(cavemenXML, aBlank);
  setTheClonedAffordances(cavemenXML);
  theEnvironmentNode     = cavemenXML.querySelectorAll(anEnvironmentNode)[0];
  theHumanNode           = cavemenXML.querySelectorAll(aHumanNode)[0];
  theAbilityNodes        = theHumanNode.children;
  thePropertyDepth       = cavemenXML.querySelectorAll(aPropertyNode).length;
  let theAffordanceNodes = cavemenXML.querySelectorAll(anAffordanceNode);
  let theTopLevelObjects = theEnvironmentNode.children;
  let theAbilitySetNodes = cavemenXML.querySelectorAll(anAbilitySetNode);
  let theEnvironment     = {};
  let theHuman           = {};
  for (let theTopLevelObject of anArrayContaining(theTopLevelObjects)) {
    theEnvironment[theNameOf(theTopLevelObject)]  = {};
    getEnvironmentProperties(theTopLevelObject, theEnvironment, theHuman);
  }
  for (let theAbilityNode of anArrayContaining(theAbilityNodes)) {
    let theAbilityName   = theNameOf(theAbilityNode);
    theAbilityExpressions[theAbilityName] = {};
    getHumanProperties(theHuman, theAbilityNode);
  }
  setTheDirectionAttributes(theAffordanceNodes);
  getTheAbilitySetRefs(theAbilitySetNodes);
  getTheEntityDeclaration(theEntities);
  getTheMovementDeclaration(theListOfMovements);
  getTheMovableObjects(theAbilityNodes);
  getTheAffordances(theAffordanceNodes);
  getTheAffordanceDeclaration(theAffordances);
  getTheConstantEnvironmentProperties();
  getTheEvolvingEnvironmentProperties();
  getTheDirectionDeclarations(theListOfDirections);
  getTheTopologyDeclarations(theListOfTopologies);
  return [theEnvironment, theHuman];
}

function getEnvironmentProperties(theNode, theEnvironment, theHuman) {
    let theDepth               = $(theNode).parents().length;
    let theName                = theNameOf(theNode);
    let theAunt                = theNode.parentNode.nextElementSibling;
    let theUncle               = theNode.parentNode.previousElementSibling;
    let theOlderSibling        = theNode.previousElementSibling;
    let theYoungerSibling      = theNode.nextElementSibling;
    let theFirstChild          = theNode.firstElementChild;
    let theFirstProperty       = theNode.lastElementChild;
    let theRecord              = theFullRecord(theNode);
    let theUncleName           = null;
    let theOlderSiblingName    = null;
    let theAuntName            = null;
    theEnvironment[theName]    = [theDepth];
    let theParentObject        = theParentObjectOf(theRecord);
    if (theDepth >= theDepthOfTheRecord) {
      theDepthOfTheRecord = theDepth;
    }
    if (theOlderSibling !== null) {
      theOlderSiblingName  = theNameOf(theOlderSibling);
    }
    if (theYoungerSibling !== null) {
      theYoungerSibling    = theNameOf(theYoungerSibling);
    }
    if (theUncle !== null) {
      theUncleName         = theNameOf(theUncle);
    }
    if (theAunt !== null) {
      theAuntName          = theNameOf(theAunt);
    }
    theHumanToPrint[theRecord] = [theDepth, theParentObject, true,
                                  theOlderSiblingName, theUncleName,
                                  theAuntName, theFirstProperty];
    theHuman[theRecord]        = [theDepth, theParentObject];
    if (theParentObject !== undefined) {
      printed[theParentObject] = [false, theDepth - 1];
    }
    printed[theName]           = [false, theDepth];
    if(theAunt !== null) {
      theEnvironment[theName].push(theAunt.nodeName);
    } else {
      theEnvironment[theName].push(null);
    }
    if(theOlderSibling !== null) {
      theEnvironment[theName].push(theOlderSibling.nodeName);
    } else {
      theEnvironment[theName].push(null);
    }
    if(theYoungerSibling   !== null) {
      theEnvironment[theName].push(theYoungerSibling.nodeName);
    } else {
      theEnvironment[theName].push(null);
    }
    if(theFirstChild !== null) {
      theEnvironment[theName].push(theFirstChild.nodeName);
    } else {
      theEnvironment[theName].push(null);
    }
    if(theFirstProperty !== null) {
      theEnvironment[theName].push(theFirstProperty.nodeName);
    } else {
      theEnvironment[theName].push(null);
    }
    let theChildren        = theNode.children;
    let thePropertyCount   = 0;
    for (let theChild of anArrayContaining(theChildren)) {
      if(isAPropertyNode(theChild)) {
        let thePropertyType   = thePropertyTypeOf(theChild);
        let theEvolution      = theEvolutionOf(theChild);
        let theConstraint     = theTextContentOf(theChild);
        let thePropertyName   = theNameOf(theChild);
        let theUsefulStuff    = [thePropertyType,theConstraint,thePropertyName];
        theEnvironment[theName].push(theUsefulStuff);
        if (thePropertyType === aSpatialProperty) {
          theSpatialProperties[thePropertyName] = true;
          if (theConstraint.length > 0) {
            theEntities[theConstraint]          = theNode;
          }
        }
        if (theRecord !== null) {
          let theObjectHavingAProperty = theLastDotSeparatedObject(theRecord);
          if(theName === theObjectHavingAProperty) {
            theEnvironmentExpressions[thePropertyName] =
              [thePropertyCount, theRecord, theConstraint,
               theEvolution    , thePropertyType];
            thePropertyCount++;
          }
        }
      }
      if(isAnObjectNode(theChild)) {
        getEnvironmentProperties(theChild, theEnvironment[theName], theHuman);
      }
    }
  }

function getHumanProperties(theHuman, theAbility) {
  if (isAnAbilityNode(theAbility) && isNotAnAbilitySetNode(theAbility)) {
    let theAbilityName         = theNameOf(theAbility);
    let theToMoveAttribute     = whatTheHumanCanMove(theAbility);
    let canMovetheObject       = theLastDotSeparatedObject(theToMoveAttribute);
      theHumanToPrint[theToMoveAttribute]
        .push(canMovetheObject, becauseSheHas(theAbility));
      theHuman[theToMoveAttribute]
        .push(canMovetheObject, becauseSheHas(theAbility));
      theAbilityExpressions[theAbilityName][theToMoveAttribute]
                                 = becauseSheHas(theAbility);
  }
  function becauseSheHas(theAbility) {
    let theType        = [];
    let theMovements   = theAbility.children;
    for (let theMovement of anArrayContaining(theMovements)) {
      let theKindsOfMovements = theMovement.attributes;
      for (let theKindOfMovement of anArrayContaining(theKindsOfMovements)) {
        let oneForTheList     = theMovement.nodeName + underscore
                                                     + theKindOfMovement.name;
        theListOfMovements[oneForTheList] = true;
        let whatDefinesTheMovement        = theValueOf(theKindOfMovement);
        theType.push([oneForTheList, whatDefinesTheMovement])
      }
    }
    return theType;
  }
}

function getTheMovableObjects(theAbilityNodes) {
  for (let theAbilityNode of anArrayContaining(theAbilityNodes)) {
    if(isAnAbilityNode(theAbilityNode)) {
      let theToMove        = whatTheHumanCanMove(theAbilityNode);
      let theMovable       = theLastDotSeparatedObject(theToMove);
      let theParent        = theMovableObjectParent(theToMove);
      if (theMovable !== undefined) {
        theMovables.push(theMovable);
      }
      if (theParent !== undefined) {
        theMovableParents.push(theParent);
      }
    }
  }
}

function getTheAffordances(theAffordanceNodes) {
  for (let theAffordanceNode of anArrayContaining(theAffordanceNodes)) {
    let theName     = theNameOf(theAffordanceNode);
    getTheAffordanceProperties(theAffordanceNode, theName, theAffordances);
  }
}

function getTheAffordanceProperties(theNode, theNodeName, theSet) {
  let theHESproperties  = theNode.children;
  if (theSet[theNodeName] === undefined) {
    theSet[theNodeName] = [];
  }
  if (theAffordanceEffects[theNodeName] === undefined) {
    theAffordanceEffects[theNodeName] = [];
  }
  for (let theHESproperty of anArrayContaining(theHESproperties)) {
    let theName         = thePropertyReferenceOf(theHESproperty);
    let theExpression;
    let theConstraint;
    let theDetails;
    let theQuantity;
    if (theHESproperty.nodeName === anEnvironmentInputNode) {
      theQuantity   = theQuantOpAttributeOf(theHESproperty);
      theDetails    = theDetailsOf(theHESproperty, theName);
      theExpression = theInitialEnvironment + theDetails[0];
      theConstraint = theDetails[1];
      theSet[theNodeName].push([theExpression, theConstraint,
        [theQuantity, theName]]);
    } else if (theHESproperty.nodeName === anEnvironmentOutputNode) {
      theQuantity = theQuantOpAttributeOf(theHESproperty);
      theDetails = theDetailsOf(theHESproperty, theName);
      theExpression = theInitialEnvironment + theDetails[0];
      theConstraint = theDetails[1];
      theAffordanceEffects[theNodeName].push([theExpression, theConstraint,
        [theQuantity, theName]]);
    } else if (theHESproperty.nodeName === anAbilityInputNode) {
      theQuantity = theQuantOpAttributeOf(theHESproperty);
      theDetails = theDetailsOf(theHESproperty, theName);
      for (let theDetail in theDetails) {
        if (theDetails.hasOwnProperty(theDetail)) {
          theExpression = theInitialAbility + theDetail;
          theConstraint = theDetails[theDetail];
          theSet[theNodeName]
              .push([theExpression, theConstraint,
                [theQuantity, theName]]);
        }
      }
    }
  }
}

function theDetailsOf(theNode, theName) {
  let theExpressions;
  let theRecord;
  let theConstraints;
  let theReturnArray;
  if(theNode.nodeName === anAbilityInputNode) {
    let theAbilityExpression =
                             Object.entries(theAbilityExpressions[theName]);
    theExpressions           = theAbilityExpression[0].pop();
    theRecord                = theAbilityExpression[0][0];
    theConstraints           = theNode.children;
    theReturnArray           = {};
    if (theConstraints.length < 1) {
      for (let theAbility in  theAbilityExpressions[theName]) {
        if (theAbilityExpressions[theName].hasOwnProperty(theAbility)) {
          let theMovements     = theAbilityExpressions[theName][theAbility];
          for (let theMovement in theMovements) {
            if (theMovements.hasOwnProperty(theMovement)) {
              let theDoF = theMovements[theMovement][0];
              let theValue = theMovements[theMovement][1];
              let theReturnObject = theAbility + aHumanProperty + theMovement +
                  openParenthesis + theDoF +
                  closeParenthesis;
              theReturnArray[theReturnObject] = [];
              theReturnArray[theReturnObject].push(equalTo, theValue);
            }
          }
        }
      }
    }
    for (let theConstraint of anArrayContaining(theConstraints)) {
      let theOperator        = theConstraint.attributes[0].value;
      let theText            = theConstraint.textContent;
      let theDirection       = theConstraint.nodeName.replace(hyphen, underscore);
      for (let theExpression in theExpressions) {
        if (theExpressions.hasOwnProperty(theExpression)) {
          let theReturnObject = theRecord + aHumanProperty + theExpression +
              openParenthesis + theDirection +
              closeParenthesis;
          if (theDirection === theExpressions[theExpression][0]) {
            theReturnArray[theReturnObject] = [];
            let thePropertyRefs = theFilteredConstraint(theText);
            for (let thePropertyRef in thePropertyRefs) {
              if (thePropertyRefs.hasOwnProperty(thePropertyRef)) {
                let theRef = thePropertyRefs[thePropertyRef];
                theText = theNewConstraint(theRef, theText);
              }
            }
            theReturnArray[theReturnObject].push(theOperator, theText);
          }
        }
      }
   }
  return theReturnArray;
} else {
    if ($.inArray(theName, Object.keys(theSpatialProperties)) < 0) {
      let theNumericalExpression
                           = theEnvironmentExpressions[theName];
      theRecord            = theNumericalExpression[1];
      let theOperator      = theOperatorOf(theNode);
      let theText          = theTextContentOf(theNode);
      let theReturnObject  = theRecord + anEnvironmentProperty +
                             theNumericalExpression[0];
      theReturnArray       = [theReturnObject, []];
      let thePropertyRefs  = theFilteredText(theText);
      for (let thePropertyRef in thePropertyRefs) {
        if (thePropertyRefs.hasOwnProperty(thePropertyRef)) {
          let theRef = thePropertyRefs[thePropertyRef];
          theText = theNewConstraint(theRef, theText);
        }
      }
    theReturnArray[1].push(theOperator);
    theReturnArray[1].push(theText);
    return theReturnArray;
  } else {
    let theSpatialExpression
                         = theEnvironmentExpressions[theName];
    theRecord            = theSpatialExpression[1];
    let theOperator      = theOperatorOf(theNode);
    let theText          = theTextContentOf(theNode);
    let theObject        = theSpatialExpression[2]
                            .replace(dotChars,underscore);
    let theReturnStart   = theText.indexOf(aBlankSpace) + 1;
    let theReturnEnd     = theText.length;
    let theTokenEnd      = theText.indexOf(aBlankSpace);
    let theTokenStart    = theText[0];
    let theConstraint    = theText
                            .substring(theTokenStart, theTokenEnd)
                              .replace(hyphen,underscore);
    let theDirection     = theText
                            .substring(theReturnStart, theReturnEnd)
                              .replace(hyphen, underscore);
    let theReturnObject  = theRecord + anEnvironmentProperty      +
                           theSpatialExpression[0]                +
                           openSquareBracket  + theObject         +
                           closeSquareBracket + openSquareBracket +
                           theDirection       + closeSquareBracket;
    theReturnArray       = [theReturnObject, []];
    theReturnArray[1].push(theOperator);
    theReturnArray[1].push(theConstraint);
    return theReturnArray;
    }
  }
}

function getTheEvolvingEnvironmentProperties() {
  for (let theExpression in theEnvironmentExpressions) {
    if (theEnvironmentExpressions.hasOwnProperty(theExpression)) {
      let thePropertyName  = theExpression;
      let thePropertyValue = theEnvironmentExpressions[theExpression][1];
      let theNumber        = theEnvironmentExpressions[theExpression][0];
      let theName          = thePropertyValue + anEnvironmentProperty + theNumber;
      thePropertyHash[theName] = thePropertyName;
    }
  }
}

function getTheConstantEnvironmentProperties() {
  for (let theExpression in theEnvironmentExpressions) {
    if (theEnvironmentExpressions.hasOwnProperty(theExpression)) {
      let thePropertyName  = theExpression;
      let theClosing       = noConstraint + thePredicateEnd;
      let thePropertyValue = theEnvironmentExpressions[theExpression][2];
      let theEvolution     = theEnvironmentExpressions[theExpression][3];
      let thePropertyType  = theEnvironmentExpressions[theExpression][4];
      if (theEvolution  === effectedByNothing) {
        let theHashValue      = aBlank;
        let theSubstringStart = thePropertyValue.lastIndexOf(equalsSign);
        let theSubstringEnd   = thePropertyValue.length;
        if(thePropertyType === aSpatialProperty) {
          theHashValue        = openSquareBracket + openCurlyBrace  +
              thePropertyName +
              theSpatialType  + verticalBar       + thePropertyName +
              equalsSign      + thePropertyValue.replace(dotChars, underscore)
                              + theSpatialPropertyEnd;
        } else {
          if (thePropertyValue.length > 1) {
            theClosing        = verticalBar + thePropertyValue + thePredicateEnd;
          }
          theHashValue        = openCurlyBrace    + thePropertyName + aColon +
                                thePropertyType.toUpperCase()       +
                                theClosing;
        }
        theConstantProperties[thePropertyName] = theHashValue;
      }
    }
  }
}

function getTheAbilitySetRefs(theAbilitySetNodes) {
  for (let theAbilitySetNode of anArrayContaining(theAbilitySetNodes)) {
    let theAbilitySetName = theNameOf(theAbilitySetNode);
    if (theAbilityRefs[theAbilitySetName] === undefined) {
      theAbilityRefs[theAbilitySetName]     = [];
    }
    let theReferencesAbilities = theAbilitySetNode.children;
    for (let theReferencedAbility of anArrayContaining(theReferencesAbilities)) {
      let theAbilityReference  = theNameOf(theReferencedAbility);
      let theQuantity          = theQuantityAttributeOf(theReferencedAbility);
      if ($.inArray(theAbilityReference, theAbilityRefs[theAbilitySetName])<0) {
        theAbilityRefs[theAbilitySetName].push(theAbilityReference);
      }
      for (let i=1; i<theQuantity; i++) {
        let originalToPush = theFilteredLHS(theAbilityReference);
        let cloneToPush    = originalToPush + underscore + i;
        if ($.inArray(cloneToPush, theAbilityRefs[theAbilitySetName])<0) {
          theAbilityRefs[theAbilitySetName].push(cloneToPush);
        }
        if ($.inArray(originalToPush, theAbilityRefs[theAbilitySetName])<0) {
          theAbilityRefs[theAbilitySetName].push(originalToPush);
        }
      }
    }
  }
}
