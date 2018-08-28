
 function writeContextName(contextName) {
   document.getElementById(contextName).value += theBeginning;
 }

 function writeModuleComposition(contextName) {
   document.getElementById(contextName).value += theEnd;
 }

 function writeSALDeclarations(varDeclarations) {
   for (let theDeclaration in varDeclarations) {
     document.getElementById('varDeclarations').value
      += varDeclarations[theDeclaration];
   }
   let contextBox = document.getElementById('fullContextBox');
   if(document.getElementById('fullContextBox' !== null)){
     contextBox.value += varDeclarations;
   }
 }

 function writeSALAffordanceModule() {
   document.getElementById('SALmodule').value += theModuleDeclaration;
   var contextBox = document.getElementById('fullContextBox');
   if(document.getElementById('fullContextBox' !== null)){
     contextBox.value += Module + '\n';
   }
 }

function printSALCodeUsing(theMeatOfTheModel) {
  let theEnvironment = theMeatOfTheModel[0];
  let theHuman       = theMeatOfTheModel[1];
  printEnvironmentDeclaration(theEnvironment);
  printHumanDeclaration(theHuman);
  printTheAbilitySets();
  printTheAffordances();
  printTheConstants();
  printTheAffordanceModule();
  printTheSpecs();
  writeSALDeclarations([theEntitiesDeclaration   , theDirectionsDeclaration ,
                        theTopologiesDeclaration , theSpatialDeclaration,
                        theEnvironmentDeclaration,
                        theMovementsDeclaration  , theHumanDeclaration      ,
                        theAbilitySetsDeclaration, theAffordancesDeclaration,
                        theConstantDeclarations  , theAffordanceFunction]);
  writeSALAffordanceModule();
}

function printEnvironmentDeclaration(theEnvironment) {
  let theDepth = openEnvironmentRecordSyntax(theEnvironment, aBlank, 1);
  theEnvironmentDeclaration  = theEnvironmentDeclaration.
    substring(0, theEnvironmentDeclaration.length - 2);
  theEnvironmentDeclaration += newLine + theClosingFor(theDepth);
}

function printHumanDeclaration(theHuman) {
  openHumanRecordSyntax(theHuman);
  theHumanDeclaration  = theHumanDeclaration.
    substring(0, theHumanDeclaration.length - 2);
  theHumanDeclaration += newLine + theClosingFor(theDepthOfTheRecord-1);
}

function openHumanRecordSyntax(theHuman) {
  for (var theObject in theHuman) {
    writeTheMovements(theObject, theHuman[theObject]);
  }
}

function isTheLastObject(theRecord, theEntity) {
  let allOfTheEntities   = Object.keys(theRecord);
  let theLastEntityIndex = allOfTheEntities.length-1;
  return allOfTheEntities[theLastEntityIndex] === theEntity;
}

function writeTheMovements(theObject, theObjects) {
  let printTheRecord      = true;
  let theDepth            = theObjects.shift();
  let theParentObject     = theObjects.shift();
  let theObjectToPrint    = theObjects.shift();
  let thePreviousParent   = undefined;
  let theNextParent       = undefined;
  let theNextChild        = undefined;
  let theParrentArray     = Object.keys(theMovableParents);
  let theCurrentSet       = Object.keys(theHumanToPrint);
  let thePreviousIndex    = theHumanToPrint[theCurrentSet[
                              theCurrentSet.indexOf(theObject)-1]];
  let theNextIndex        = theHumanToPrint[theCurrentSet[
                              theCurrentSet.indexOf(theObject)+1]];
  let theParentIndent     = theIndentation(theDepth-1);
  let theIndent           = theIndentation(theDepth);
  if(theNextIndex       !== undefined) {
    theNextParent         = theNextIndex[1];
    theNextChild          = theNextIndex[3];
  }
  if(thePreviousIndex   !== undefined) {
    thePreviousParent     = thePreviousIndex[1];
  }
  let theSibling          = theHumanToPrint[theObject][3];
  let theAuntOrUncle      = theHumanToPrint[theObject][4];
  let theYounger          = theHumanToPrint[theObject][5];
  let theLastChild        = theHumanToPrint[theObject][6];
  if ($.inArray(theParentObject, theParrentArray) >= 0) {
    if (theParentObject !== thePreviousParent) {
      if ($.inArray(theParentObject, theMovables) < 0 && theParentObject !== undefined) {
        if (printed[theAuntOrUncle] !== undefined) {
          printTheRecord = !printed[theAuntOrUncle][0] && $.inArray(theAuntOrUncle, theMovables) < 0;
        } else {
          printTheRecord = !printed[theParentObject][0];
        }
        if (printTheRecord) {
          theHumanDeclaration += theParentIndent + theRecordTypeOpening + theParentObject + aColon + newLine;
          printed[theParentObject][0]   = true;
        } else if (!printed[theParentObject][0]) {
            theHumanDeclaration += theParentIndent + twoSpaceIndentation + theParentObject + aColon + newLine;
            printed[theParentObject][0] = true;
      }
    } else if (!printed[theParentObject][0]) {
      theHumanDeclaration += theParentIndent + twoSpaceIndentation + theParentObject + aColon + newLine;
      printed[theParentObject][0] = true;
    }
  }
}
let closeTheRecord         = false;
let theOpening             = aBlank;
for (let theMovements in theObjects) {
  let theNumberOfMovements = theObjects[theMovements].length - 1;
  for (let theMovement in theObjects[theMovements]) {
    closeTheRecord         = theMovement >= theNumberOfMovements;
    if (printed[theSibling] !== undefined) {
      let theSiblingDepth     = printed[theSibling][1];
      let theObjectDepth      = printed[theObjectToPrint][1];
      printTheRecord = theSiblingDepth === theObjectDepth
                        && $.inArray(theSibling, theMovables) < 0;
    } else {
      if (printed[theParentObject] !== undefined) {
        printTheRecord = printed[theParentObject][0];
      } else {
        printTheRecord = true;
      }
    }
    if (theMovement < 1 && printTheRecord) {
      theOpening = theRecordTypeOpening;
      theHumanToPrint[theObject][2] = false;
    } else {
      theOpening = twoSpaceIndentation;
    }
    theHumanDeclaration +=  theIndent + theOpening + theObjectToPrint + aHumanProperty
                        + theMovement + aColon     + theHumanPropertyBegin(theObject)
                        + theObjects[theMovements][theMovement][0]  + thePredicateEnd;
    let theDetails = theObjects[theMovements][theMovement];
    let theValue   = theDetails[1];
    if(isNaN(theValue)) {
      theHumanDeclaration += aReferencedBooleanAbility;
      } else {
          if(thereAreAbilitySets) {
          theHumanDeclaration += aReferencedNumberAbility;
          } else {
            theHumanDeclaration += aNumericalMovement(theValue);
        }
      }
      if (closeTheRecord) {
        if (theAuntOrUncle !== null || theDepth === theDepthOfTheRecord) {
          theHumanDeclaration += recordClosing;
        }
      }
      theHumanDeclaration += commaThenNewLine;
    }
  }
}

function openEnvironmentRecordSyntax(theObjects           , theObject       ,
                                     theNumberOfProperties, thePropertyCount,
                                     theElder, theYounger , theFirstChild   ,
                                     theFirstProperty     , theAuntOrUncle) {
  let theIndent                 = theIndentation(theEnvironmentDepth);
  for (var identifier in theObjects) {
    if (isNaN(identifier)) {
      theEnvironmentDepth       = theObjects[identifier].shift();
      theAuntOrUncle            = theObjects[identifier].shift();
      theElder                  = theObjects[identifier].shift();
      theYounger                = theObjects[identifier].shift();
      theFirstChild             = theObjects[identifier].shift();
      theFirstProperty          = theObjects[identifier].shift();
      thePropertyCount          = 1;
      theObject                 = identifier;
      theNumberOfProperties     = theObjects[identifier].length;
      if(theNumberOfProperties < 1) {
        if (theElder !== anEnvironmentObjectNode) {
          if (theElder == null) {
            theEnvironmentDeclaration += theIndent + theRecordTypeOpening
                                      + theObject  + colonThenNewLine;
          } else {
            theEnvironmentDeclaration += theIndent + twoSpaceIndentation +
              theRecordTypeOpening    + theObject  + colonThenNewLine;
          }
        } else {
          theEnvironmentDeclaration += theIndent + twoSpaceIndentation
                                                 + theObject + colonThenNewLine;
        }
      }
      openEnvironmentRecordSyntax(theObjects[identifier], theObject       ,
                                  theNumberOfProperties , thePropertyCount,
                                  theElder, theYounger  , theFirstChild   ,
                                  theFirstProperty      , theAuntOrUncle);
    } else {
      theFlattenedDepth++;
      let printRecordOpening      = false;
      let theDetails              = theObjects[identifier];
      let theConstraint           = aBlank;
      let theOpening              = aBlank;
      let theClosing              = aBlank;
      let theLocalVariable        = aBlank;
      if(theDetails[2]   !== undefined) {
        theLocalVariable   = theDetails[2];
      } else {
        theLocalVariable   = anEnvironmentProperty;
      }
      if(theDetails[0]  !== aSpatialProperty) {
        theOpening         =
          theNumericalPropertyBegin(theLocalVariable, theDetails[0]);
        theClosing         = thePredicateEnd;
        theConstraint      = verticalBar + theDetails[1];
        if (theEnvironmentExpressions[theLocalVariable][3]
                         === effectedByEnvironment) {
            theEvolvingEnvironment[theLocalVariable]
                           = [theOpening, theConstraint, theClosing];
        }
      } else {
        theOpening         = theSpatialPropertyBegin(theLocalVariable);
        theClosing         = theSpatialPropertyEnd;
        theConstraint      = verticalBar + theLocalVariable + equalsSign +
                             theDetails[1].replace(dotChars, underscore);
        if (theEnvironmentExpressions[theLocalVariable][3]
                        === effectedByEnvironment) {
           theEvolvingEnvironment[theLocalVariable]
                          = [theOpening, theConstraint, theClosing];
        }
      }
      if (theDetails[1].length < 1) {
         theConstraint = noConstraint;
      }
      if (thePropertyCount < theNumberOfProperties) {
        theClosing      += commaThenNewLine;
      }
      if(thePropertyCount    >= theNumberOfProperties) {
        if (theFlattenedDepth >= thePropertyDepth) {
          theLastObjectDepth = printed[theObject][1];
        }
        if (theFirstProperty !== anEnvironmentObjectNode) {
          if (theYounger === null) {
            theClosing      += recordClosing;
          }
          if (theAuntOrUncle === null && theYounger !== undefined && theFlattenedDepth < thePropertyDepth) {
            let theNewIndent = theIndentation(theIndent.length-4);
              theClosing    += newLine + theNewIndent + recordClosing;
          }
          theClosing += commaThenNewLine;
        } else {
           theClosing += commaThenNewLine       + theIndent
             + twoSpaceIndentation + theObject  + aColon + newLine;
        }
      }
      let theTypeDeclaration = theOpening + theConstraint + theClosing;
      if (identifier < 1 && theElder !== anEnvironmentObjectNode) {
          theEnvironmentDeclaration += theIndent + theRecordTypeOpening + theObject
            + anEnvironmentProperty + identifier + aColon;
      } else {
          theEnvironmentDeclaration += theIndent + twoSpaceIndentation   + theObject
                                    + anEnvironmentProperty + identifier + aColon;
      }
      theEnvironmentDeclaration += theTypeDeclaration;
    }
    thePropertyCount++;
  }
  return theEnvironmentDepth;
}

function getTheLowestLevel(theArrays) {
  let theLowestLevel = 0;
  for (let theArray in theArrays) {
    if(isNaN(theArray)) {
      for (let theProperty in theArrays[theArray]) {
        if(theArrays[theArray].constructor == Array) {
          theLowestLevel++;
        }
      }
    }
  }
  return theLowestLevel;
}

function formatTheAbilityExpressions(theAbilityExpression, theContents,
                                     theIndex            , theConstraint) {
  return theAbilityExpression + aHumanProperty + theIndex
                              + theExpressionFormat(theContents, theConstraint);
}

function printTheAbilitySets() {
  let theAbilitySets = {};
  for (let theAbilityRefList in theAbilityRefs) {
    let theConstraintSet = [];
    theAbilitySets[theAbilityRefList] = [];
    let theNumberOfRefs = theAbilityRefs[theAbilityRefList].length;
    for (let theAbilityRef in  theAbilityRefs[theAbilityRefList]) {
      let theAbility = theAbilityRefs[theAbilityRefList][theAbilityRef];
      theAbilitySet = writeAnAbilitySet(theAbility);
      theAbilitySets[theAbilityRefList].push(theAbilitySet);
    }
    if (Object.keys(theAbilityRefs).length > 1) {
      theConstraintSet =
        writeAnAbilitySetConstraint(theAbilityRefs[theAbilityRefList]);
      theAbilitySets[theAbilityRefList].push(theConstraintSet);
    }
  }
  let theAbilityToPrint = aBlank;
  let theSet     = 0;
  let theSets    = Object.keys(theAbilitySets).length;
  if (theSets > 0) {
    thereAreAbilitySets = true;
  }
  for (let theAbilitySet in theAbilitySets) {
    theSet++;
    theAbilitySetsDeclaration
                += theIndentation(theSet) + openParenthesis;
    let theRefs  = theAbilitySets[theAbilitySet].length;
    let theRef   = 0;
    for (let theAbility in theAbilitySets[theAbilitySet]) {
      theRef++;
      theAbilityToPrint
                 = theAbilitySets[theAbilitySet][theAbility]
                    .join(logicalOperatorThenNewLine(theSet, aConjunction));
      if (theRef < theRefs) {
        theAbilitySetsDeclaration
                += theAbilityToPrint +
                          logicalOperatorThenNewLine(theSet, aConjunction);
      }
    } if (theSet < theSets) {
        theAbilitySetsDeclaration    += theAbilityToPrint + closeParenthesis +
            logicalOperatorThenNewLine(theSet, anXORdisjunction);
    }
  }
  theAbilitySetsDeclaration += theAbilityToPrint + closeParenthesesSemicolon
                            + newLine            + newLine;
}

function writeAnAbilitySet(theAbilityRef) {
  let theExpressionToPrint  = [];
  for (let theAbilityExpression in theAbilityExpressions) {
    let theSetIndex         = 0;
      for (let theExpression in theAbilityExpressions[theAbilityExpression]) {
        let theRecord             = theInitialAbility + theExpression;
        let theExpressionContents =
          theAbilityExpressions[theAbilityExpression][theExpression];
        if (theAbilityExpression  === theAbilityRef) {
        for (let theContents in theExpressionContents) {
          theExpressionToPrint.push(formatTheAbilityExpressions(theRecord,
            theExpressionContents[theContents], theSetIndex, true));
          theSetIndex++;
        }
      }
    }
  }
  return theExpressionToPrint;
}

function writeAnAbilitySetConstraint(theList) {
  let theConstraintToPrint = [];
  for (let theAbilityExpression in theAbilityExpressions) {
    let theSetIndex   = 0;
    for (let theExpression in theAbilityExpressions[theAbilityExpression]) {
      let theRecord = theInitialAbility + theExpression;
      let theExpressionContents =
            theAbilityExpressions[theAbilityExpression][theExpression];
      if($.inArray(theAbilityExpression, theList) < 0) {
        for (let theContents in theExpressionContents) {
          theConstraintToPrint
           .push(formatTheAbilityExpressions(theRecord,
                                             theExpressionContents[theContents],
                                             theSetIndex, false));
          theSetIndex++;
        }
      }
    }
  }
  return theConstraintToPrint;
}

function printTheAffordances() {
  let oneTab = 1;
  for (let theAffordance in theAffordances) {
    if (isAnIntermediateAffordance(theAffordance)) {
      theAffordanceFunction     += aTab + ELSIF   +
      affordanceEquals          + theAffordance + THEN + newLine +
                                  twoTabs       + theLambda;
    } else {
      theAffordanceFunction += affordanceEquals + theAffordance + THEN +
          newLine           + twoTabs           + theLambda;
    }
    for (let theConstraints in theAffordances[theAffordance]) {
      let hasNoneOperator    = false;
      let theNumber          = 0;
      let theConstraint      = theAffordances[theAffordance][theConstraints];
      let theRHS             = theConstraint[1][1];
      let theEquality        = theConstraint[1][0];
      let theLHS             = theConstraint[0];
      let theQuantity        = theConstraint[2][0];
      let theObject          = theConstraint[2][1];
      if ($.inArray(theObject, Object.keys(theSpatialProperties)) >= 0) {
        let theTokenStart    = theRHS.indexOf(aBlankSpace);
        let theTokenEnd      = theRHS.length-1;
        let theDirection     = openSquareBracket +
          theRHS.replace(hyphen, underscore) + closeSquareBracket;
      }
      if (theQuantity === none) {
        hasNoneOperator      = true;
      }
      if (theQuantity !== null) {
        if (theQuantity.includes(hyphen)) {
          let theNumberStart   = theQuantity.lastIndexOf(hyphen) + 1;
          let theNumberEnd     = theQuantity.length;
          theNumber            =
            theQuantity.substring(theNumberStart, theNumberEnd);
          if (theQuantity.includes(exactly)) {
          theQuantity          = exactly;
        } else if (theQuantity.includes(atLeast)) {
            if (theNumber<2) {
              theQuantity      = null;
            } else {
              theQuantity      = atLeast;
          }
        } else if (theQuantity.includes(atMost)) {
            if (theNumber<2) {
              theQuantity      = null;
            } else {
              theQuantity      = atMost;
            }
          }
        }
      }
      let theOriginal = theFilteredLHS(theObject);
      let theDepth    = theCloneDepth[theOriginal];
      theAffordanceFunction += twoTabs                  +
        breakTheLongConstraint(theLHS, hasNoneOperator) +
        theOperator(theEquality)                        +
        breakTheLongValue(theRHS, hasNoneOperator);
      switch(theQuantity) {
        case exactly:
          getEXACTLYConstraintsFor(theAffordance, theLHS, theRHS, theEquality, theNumber, theOriginal);
        break;
        case atLeast:
          getATLEASTConstraintsFor(theAffordance, theLHS, theRHS, theEquality, theNumber, theOriginal);
        break;
        case all:
          getALLConstraintsFor(theAffordance, theLHS, theRHS, theEquality, theOriginal);
        break;
        case null:
          theAffordanceFunction += closeParenthesis;
        break;
      }
      if (isAnIntermediateConstraint(theConstraint,
                                     theAffordances[theAffordance])) {
        if (!(theQuantity === atMost && theNumber >= theDepth + 1)) {
          theAffordanceFunction += logicalOperatorThenNewLine(oneTab, aConjunction);
        }
      } else {
        theAffordanceFunction   += closeParenthesis + newLine;
      }
    }
  }
  theAffordanceFunction += theAffordanceClosing;
}

function printTheConstants() {
  for (let theConstant in theConstantProperties) {
    getTheConstantDeclaration(theConstant, theConstantProperties[theConstant]);
  }
  theConstantDeclarations += newLine;
}

function printTheAffordanceModule() {
  let evolvingEffects = {};
  let evolvingEnviron = {};
  Object.keys(theAffordanceEffects).forEach(effect => {
    let areAlsoEffects = flatten(theAffordanceEffects[effect]);
    Object.keys(theEvolvingEnvironment).forEach(property => {
      if ($.inArray(property, areAlsoEffects) >= 0) {
        evolvingEffects[property] = true;
      }
    })
  });
  theModuleDeclaration += theLocalIndent  + LOCAL + theActualized;
  let thereAreEvolvingEnvironmentProperties = false;
  for (let theExpression in theEnvironmentExpressions) {
    let thePropertyName     = theExpression;
    let theEvolution        = theEnvironmentExpressions[theExpression][3];
    let theDetails          = theEvolvingEnvironment[theExpression];
    if (theEvolution    === effectedByEnvironment) {
      theModuleDeclaration += theLocalIndent  + LOCAL + thePropertyName + aColon
      + theLocalPredicateFor(theDetails[0], theDetails[1], theDetails[2], true);
      thereAreEvolvingEnvironmentProperties = true;
    }
  }
  printTheInitializations();
  printTheEvolvingEnvironmentTransitions(evolvingEffects);
}

function printTheInitializations() {
  theModuleDeclaration    += theLocalIndent + INITIALIZATION + newLine;
  theModuleDeclaration    += theInitActualized;
  if (thereAreAbilitySets) {
    theModuleDeclaration += theLocalIndent        + aTab                  +
      theGlobalAbilities + IN + theLocalAbilitiesValue + semicolonThenNewLine;
  }
}

function printTheEvolvingEnvironmentTransitions(evolvingEffects) {
  let theElseEffects = '';
  theModuleDeclaration   += theLocalIndent  + TRANSITION + newLine;
  Object.keys(theEvolvingEnvironment).forEach(theProperty => {
    let theDetails         = theEvolvingEnvironment[theProperty];
    theModuleDeclaration  += theLocalIndent + aTab       + theProperty   +
      nextState           + IN              +
        theLocalPredicateFor(theDetails[0], theDetails[1], theDetails[2], false);
    let theInitialProperty   = theInitialEnvironment     +
          theEnvironmentExpressions[theProperty][1]      +
          anEnvironmentProperty + theEnvironmentExpressions[theProperty][0];
    let theNextStateProperty = theNextStateEnvironment   +
          theEnvironmentExpressions[theProperty][1]      +
          anEnvironmentProperty + theEnvironmentExpressions[theProperty][0];
    if (!evolvingEffects[theProperty]) {
      theModuleDeclaration += theLocalIndent + aTab       +
        theNextStateProperty                 + equalsSign +
          theProperty      + semicolonThenNewLine;
    } else {
      theElseEffects += twoTabs  + theNextStateProperty +
          equalsSign + theProperty + semicolonThenNewLine;
    }
  });
  if (thereAreAbilitySets) {
    theModuleDeclaration += theLocalIndent + aTab + theGlobalAbilities         +
               nextState + IN              + theLocalAbilitiesValue            +
                                             semicolonThenNewLine;
  }
  printTheAffordanceEffects(theElseEffects);
}

function printTheAffordanceEffects(theElseEffects) {
  let theTransitionCounter   = 0;
  let whatToPrint            = {};
  for (let theAffordanceEffect in theAffordanceEffects) {
      theModuleDeclaration += aTab + openSquareBracket;
      if (theTransitionCounter > 0) {
        theModuleDeclaration += closeSquareBracket;
      }
      theModuleDeclaration += theTransitionLambda(theAffordanceEffect);
      for (let theEffect in theAffordanceEffects[theAffordanceEffect]) {
        let theConstraint = theAffordanceEffects[theAffordanceEffect][theEffect];
        let hasNoneOperator    = false;
        let theNumber          = 0;
        let theRHS             = theConstraint[1][1];
        let theEquality        = theConstraint[1][0];
        let theLHS             = theConstraint[0];
        let theQuantity        = theConstraint[2][0];
        let theObject          = theConstraint[2][1];
        if (theQuantity !== null) {
          if (theQuantity.includes(hyphen)) {
            let theNumberStart   = theQuantity.lastIndexOf(hyphen) + 1;
            let theNumberEnd     = theQuantity.length;
            theNumber            =
              theQuantity.substring(theNumberStart, theNumberEnd);
            if (theQuantity.includes(exactly)) {
              theQuantity          = exactly;
            } else if (theQuantity.includes(all)) {
              theQuantity        = all;
            } else {
              theQuantity        = atLeast;
            }
          }
        }
        let theTransition = theLocalIndent       + twoTabs +
          theNextStateVariable(theConstraint[0]) +
            theOperator(theConstraint[1][0])     +
              theConstraint[1][1]                +  semicolonThenNewLine;
          theModuleDeclaration += theTransition;
        switch(theQuantity) {
          case null:
           break;
           case exactly:
            getEXACTLYEffectsFor(theLHS, theRHS, theEquality, theNumber, theObject);
           break;
           case all:
            getALLEffectsFor(theLHS, theRHS, theEquality, theObject);
           break;
           case atLeast:
            getATLEASTEffectsFor(theLHS, theRHS, theEquality, theNumber, theObject);
           break;
        }
      }
      theTransitionCounter++;
    }
  theModuleDeclaration += theModuleClosing(theElseEffects);
}

function printTheSpecs() {
  theModuleDeclaration += theSpecs;
}
