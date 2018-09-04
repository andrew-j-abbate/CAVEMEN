// auxilliary cavemenTranslator functions

function captureClonedRecords(theNode, theXML, theCount) {
  let theChildren = anArrayContaining(theNode.children);
  for (let theChild of theChildren) {
    captureClonedRecords(theChild, theXML, theCount);
  }
  let theName       = theNameOf(theNode);
  if (theNode.hasAttribute(aQuantityAttribute)) {
    let theQuantity = theNode.getAttribute(aQuantityAttribute);
    theCloneRecordQuantities[theName] = theQuantity;
  }
}

function getTheClonedSpatialProperties(theNode, theXML) {
  let theChildren = anArrayContaining(theNode.children);
  for (let theChild of theChildren) {
    getTheClonedSpatialProperties(theChild, theXML);
  }
  setTheClonedSpatialProperties(theNode, theXML)
}

function setTheClonedSpatialProperties(theNode, theXML) {
  let thePropertyNodes  = theNode.children;
  let thePropertyCount  = 0;
  let allTheChildren = $(theNode).children().map(function () {return this.nodeName}).get();
  if(allTheChildren.length <1 && isAnObjectNode(theNode)) {
    let nullProperty = theXML.createElement(aPropertyNode);
    nullProperty.setAttribute(itsName, "null");
    nullProperty.setAttribute(anEvolutionAttribute, none);
    nullProperty.setAttribute(itsType, BOOLEAN);
    theNode.appendChild(nullProperty);
    addNullProp = true;
  }
  for (let thePropertyNode of anArrayContaining(thePropertyNodes)) {
    if(isAPropertyNode(thePropertyNode)) {
      if (thePropertyTypeOf(thePropertyNode) === aSpatialProperty) {
        let theRecord       = theFullRecord(theNode);
        let theName         = theNameOf(thePropertyNode);
        let theConstraint   = thePropertyNode.textContent;
        let theEvolution    = theEvolutionOf(thePropertyNode);
        let theOldName      = theFilteredLHS(theName);
        theSpatialProperties[theName]     = true;
        if(theClonedProperties[theName] === undefined) {
          theClonedProperties[theName]    = {};
        }
        let whatToPrint =  [...theFullRecords(theNode),
                            ...theConstraint.split(aDot)];
        if (theSpatialPairs[theName] === undefined) {
          theSpatialPairs[theName] = whatToPrint;
        } else {
          if (whatToPrint.every(i => $.inArray(i, theSpatialPairs[theName]) < 0)) {
            theSpatialPairs[theName].push(whatToPrint);
          }
        }
        let theRefs         = thePropertyNode.textContent.split(aDot);
        theRefs.forEach(function(theRef) {
          let theRefQuantity = theCloneRecordQuantities[theRef];
          for (let i=theRefQuantity-1; i>0; --i) {
            let theClone         = thePropertyNode.cloneNode(true);
            let theNewRef        = theRef    + underscore + i;
            let theRefConstraint = theConstraint.replace(theRef, theNewRef);
            theClone.textContent = theRefConstraint;
            let theRefArray      = Object.keys(theClonedSpatialProperties);
            setTheNewProperty(theName, theOldName, theClone, i);
            let theCloneName     = theNameOf(theClone);
            theSpatialProperties[theCloneName] = true;
            theClonedProperties[theName][theCloneName] =
                            [thePropertyCount, theRecord, theRefConstraint,
                             theEvolution    , aSpatialProperty];
            thePropertyCount++;
            setTheChildNames(theClone, theCloneName, i);
            if ($.inArray(theRefConstraint, theRefArray)<0) {
              theClonedSpatialProperties[theRefConstraint] = true;
              let cloneToPrint =  [...theFullRecords(theNode),
                                   ...theRefConstraint.split(aDot)];
              if (theSpatialPairs[theCloneName] === undefined) {
                theSpatialPairs[theCloneName] = cloneToPrint;
              } else {
                if (cloneToPrint.every(i => $.inArray(i, theSpatialPairs[theCloneName]) < 0)) {
                  theSpatialPairs[theCloneName].push(cloneToPrint);
                }
              }
              thePropertyNode.insertAdjacentElement(insertAfter, theClone);
            }
          }
        });
      }
    } else {
      setTheClonedSpatialProperties(thePropertyNode, theXML);
    }
  }
}

function setTheChildNames(theClone, theName, i) {
  let theChildren = theClone.children;
  for (let theChild of anArrayContaining(theChildren)) {
    if (isAPropertyNode(theChild)) {
      setTheNewProperty(theNameOf(theChild), theName, theChild, i);
    } else {
      setTheChildNames(theChild, i);
    }
  }
}

function captureQuantitySpecifications(theNode, theXML, theClones) {
  let theChildren = anArrayContaining(theNode.children);
  for (let theChild of theChildren) {
    captureQuantitySpecifications(theChild, theXML, theClones);
  }
  let theName          = theNameOf(theNode);
  if (isAnObjectNode(theNode)) {
    let theQuantity    = theNode.getAttribute(aQuantityAttribute);
    for (let i = theQuantity-1; i>0; i--) {
      let theClonedNode = theNode.cloneNode(true);
      let theNewName    = theName + underscore + i;
      theClonedNode.setAttribute(itsName, theNewName);
      theNode.insertAdjacentElement(insertAfter, theClonedNode);
      setTheClonedProperties(theClonedNode, i, theClones);
      setTheClonedAbilities(theClonedNode, i, theXML);
    }
  }
}

function setTheClonedProperties(theNode, theNumber, theClones) {
  let thePropertyNodes  = theNode.children;
  let thePropertyCount  = 0;
  for (let thePropertyNode of anArrayContaining(thePropertyNodes)) {
    if(isAPropertyNode(thePropertyNode)) {
      let theRecord       = theFullRecord(theNode);
      let theName         = theNameOf(thePropertyNode);
      let theTag          = underscore + theNumber;
      let theNewProperty  = theName    + theTag;
      let theConstraint   = thePropertyNode.textContent;
      let theEvolution    = theEvolutionOf(thePropertyNode);
      let thePropertyType = thePropertyTypeOf(thePropertyNode);
      let theOldName      = theFilteredLHS(theName);
      let theDepth        = $(theNode).parents().length;
      if(theClonedProperties[theOldName] === undefined) {
        theClonedProperties[theOldName]    = {};
      }
      if (thePropertiesDepth[theOldName] === undefined) {
        thePropertiesDepth[theOldName]   = theDepth;
      }
      setTheNewProperty(theOldName, theNewProperty, thePropertyNode, theNumber);
      setTheClonedConstraintOf(thePropertyNode, false);
      let theCloneName = theNameOf(thePropertyNode);
      if (thePropertyTypeOf(thePropertyNode) === aSpatialProperty) {
        theSpatialProperties[theCloneName]   = true;
        theEntities[theConstraint] = theNode.parentNode;
        let whatToPrint =  [...theFullRecords(theNode),
                            ...theConstraint.split(aDot)];
        if (theSpatialPairs[theCloneName] === undefined) {
          theSpatialPairs[theCloneName] = whatToPrint;
        } else {
          if (whatToPrint.every(i => $.inArray(i, theSpatialPairs[theCloneName]) < 0)) {
            theSpatialPairs[theCloneName].push(whatToPrint);
          }
        }
      }
      theClonedProperties[theOldName][theCloneName] =
                                  [thePropertyCount, theRecord, theConstraint,
                                   theEvolution    , thePropertyType];
      thePropertyCount++;
    } else {
      if (isAnObjectNode(thePropertyNode)) {
        let theParentRecord = theFullRecord(thePropertyNode);
        if (theEntities[theParentRecord] === undefined) {
          theEntities[theParentRecord] = thePropertyNode;
        }
      }
      setTheClonedProperties(thePropertyNode, theNumber, theClones);
    }
  }
}

function setTheClonedAbilities(theClonedNode, theNumber, theXML) {
  let allAbilityNodes   = theXML.getElementsByTagName(anAbilityNode);
  let theCloneName      = theNameOf(theClonedNode)
  for (let theAbilityNode of anArrayContaining(allAbilityNodes)) {
    if (theAbilityNode.parentNode.nodeName === aHumanNode) {
      let theEntity    = whatTheHumanCanMove(theAbilityNode);
      let theNewEntity = theNewEntityFor(theEntity, theCloneName);
      let theOldName   = theNameOf(theAbilityNode);
      let theOriginal  = theFilteredLHS(theOldName);
      if (theClonedAbilities[theOriginal] === undefined) {
        theClonedAbilities[theOriginal] = {};
      }
      let theSibling   = theAbilityNode;
      let theAbility   = theAbilityNode.cloneNode(true);
      theAbility.setAttribute(toMove, theNewEntity);
      if (whatTheHumanCanMove(theSibling) !== theNewEntity) {
        setTheNewProperty(theOriginal, theOriginal, theAbility, theNumber);
        let theNewName = theNameOf(theAbility);
        if (theClonedAbilities[theOriginal][theNewName] === undefined) {
          theClonedAbilities[theOriginal][theNewName] = [theNumber, theNewEntity];
          theAbilityNode.insertAdjacentElement(insertAfter, theAbility);
        }
      }
    }
  }
}

var theTagOf = function(theNodeName) {
  let theReturnString = aBlank;
  let theStringStart  = theNodeName.indexOf(underscore);
  let theStringEnd    = theNodeName.length;
  if (theStringStart > 0) {
    theReturnString   = theNodeName.substring(theStringStart, theStringEnd);
  }
  return theReturnString;
}

function setTheClonedAffordances(theXML) {
  let theNodes        = theXML.getElementsByTagName(anAffordanceNode);
  let whatToPrint     = {};
  if(addNullProp) {
    whatToPrint["null"] = true;
  }
  for (let theNode of anArrayContaining(theNodes)) {
    let theChildren = theNode.children;
    for (let theChild of anArrayContaining(theChildren)) {
      if (theChild.nodeName === anAbilityInputNode) {
        $(theChild).children()
            .map(function () {
              return this.textContent
            }).get().forEach(function (i) {
          i.split(notAWord).forEach(function (ref) {
            if ($.inArray(theFilteredLHS(ref), Object.keys(theClonedProperties)) >= 0) {
              whatToPrint[ref] = true;
            }
          });
        });
      } else {
        whatToPrint[theNameOf(theChild)] = true;
        if ($.inArray(theNameOf(theChild), Object.keys(theSpatialProperties)) < 0) {
          theChild.textContent.split(notAWord).forEach(function (ref) {
            if ($.inArray(theFilteredLHS(ref), Object.keys(theClonedProperties)) >= 0) {
              whatToPrint[ref] = true;
            }
          });
        }
      }
    }
  }
  let theAbilities    = theXML.getElementsByTagName(anAbilityNode);
  let theHash         = setTheInputLevels(theAbilities, Object.keys(whatToPrint));
  delete theHash[Object.keys(theHash)[0]];
  for (let theNode of anArrayContaining(theNodes)) {
    let theName       = theNameOf(theNode);
    for (let theLevel in theHash) {
      let newNames    = Array.prototype.concat.apply([], theHash[theLevel]);
      let theClone    = theNode.cloneNode(true);
      let theInputs   = theClone.children;
      let theInputName;
      for (let theInputOutput of anArrayContaining(theInputs)) {
        let theInput, theOutput;
        switch(theInputOutput.nodeName) {
          case anEnvironmentInputNode:
          theInput = theInputOutput;
          theInputName   = theFilteredLHS(thePropertyReferenceOf(theInput));
          newNames.forEach(function(input) {
            let theOldInput  = theFilteredLHS(input);
            if (theInputName === theOldInput) {
              theInput.setAttribute(anInputAttribute, input);
              if (thePropertyReferenceOf(theInput).includes(underscore)) {
                setTheClonedConstraintOf(theInput, true);
              }
            }
          });
          break;
          case anEnvironmentOutputNode:
            theOutput = theInputOutput;
            let theOutputName = theFilteredLHS(thePropertyReferenceOf(theOutput));
            newNames.forEach(function(output) {
              let theOldOutput = theFilteredLHS(output);
              if (theOutputName === theOldOutput) {
                theOutput.setAttribute(anOutputAttribute, output);
                setTheClonedConstraintOf(theOutput, true);
              }
            });
          break;
          case anAbilityInputNode:
          theInput = theInputOutput;
          theInputName   = theFilteredLHS(thePropertyReferenceOf(theInput));
          newNames.forEach(function(input) {
            let theOldInput  = theFilteredLHS(input);
            if (theInputName === theOldInput) {
              theInput.setAttribute(anInputAttribute, input);
              if (theClonedAbilities[theOldInput][input]) {
                setTheClonedConstraintOf(theInput, true);
              }
            }
          });
          break;
        }
      }
      theClone.setAttribute(itsName, theName + underscore + theLevel);
      theNode.insertAdjacentElement(insertAfter, theClone);
    }
  }
}

function setTheInputLevels(theAbilityNodes, theClonesToPrint) {
  let theHash = {};
  let theAbilityHash = {};
  for (let theProperty in theCommonProperties) {
    let theLastIndex = theCommonProperties[theProperty].length-1;
    if (theCommonProperties[theProperty][theLastIndex].constructor === Array) {
      let theArray = theCommonProperties[theProperty].pop();
      for (let theRef in theArray) {
        theCommonProperties[theProperty].push(...theArray[theRef]);
      }
    }
  }
  let pushed = {};
  for (let theProperties in theCommonProperties) {
    for (let thePropertyList in theCommonProperties) {
      if (theFilteredLHS(thePropertyList) !== theFilteredLHS(theProperties)) {
        let theInnerList = theCommonProperties[thePropertyList];
        if (theSpatialPairs[theProperties] !== undefined && Object.keys(theClonedSpatialProperties).length > 0) {
          if (theSpatialPairs[theProperties].every(i => $.inArray(i, theInnerList) >= 0)) {
            if (pushTheClone(theProperties, theClonesToPrint)) {
              pushed[theProperties]    = [thePropertyList];
              pushed[thePropertyList]  = [theProperties];
            }
            if (pushTheClone(thePropertyList, theClonesToPrint)) {
              theHash[theProperties]   = [thePropertyList];
              theHash[thePropertyList] = [theProperties];
            }
          }
        }
      }
    }
  }
  for (let theProperties in theCommonProperties) {
    for (let thePropertyList in theCommonProperties) {
      let theOldProperty = theFilteredLHS(thePropertyList);
      if (theFilteredLHS(thePropertyList) !== theFilteredLHS(theProperties)) {
        let theCount = 0;
        let theOuterList = theCommonProperties[theProperties];
        let theInnerList = theCommonProperties[thePropertyList];
        let theDepth     = thePropertiesDepth[theOldProperty];
        theOuterList.forEach(function (i) {
          if ($.inArray(i, theInnerList) >= 0) {
            theCount++;
          }
        });
        if (theCount >= theDepth-1) {
          if (pushed[theProperties] === undefined || pushed[thePropertyList] === undefined) {
            if (pushed[theProperties] === undefined) {
              if (theHash[theProperties] === undefined) {
                theHash[theProperties] = [thePropertyList];
              } else {
                theHash[theProperties].push(thePropertyList);
              }
            } else if (pushed[thePropertyList] === undefined) {
                if(theHash[thePropertyList] === undefined) {
                  theHash[thePropertyList] = [theProperties];
                } else {
                  theHash[thePropertyList].push(theProperties);
                }
            }
          }
          Object.keys(theSiblingSpatials).forEach(function (key) {
            if (key === theProperties) {
              if (theHash[theProperties] !== undefined) {
                let theKeys = theSiblingSpatials[key];
                theKeys.forEach(function(theKey) {
                  if ($.inArray(theKey, theHash[theProperties]) < 0
                    && pushTheClone(theKey, theClonesToPrint)) {
                    theHash[theProperties].push(theKey);
                  }
                });
              } else {
                theHash[theProperties] = [...theSiblingSpatials[key]];
              }
            }
          });
        }
        for (let theAbility of anArrayContaining(theAbilityNodes)) {
          let theName    = theNameOf(theAbility);
          let theEntities = whatTheHumanCanMove(theAbility).split(aDot);
          if (theEntities.every(i => $.inArray(i, theOuterList) >= 0)
              && pushTheClone(theProperties, theClonesToPrint)) {
            if (theAbilityHash[theProperties] === undefined) {
              theAbilityHash[theProperties] = [theName];
            }
            if ($.inArray(theName, theAbilityHash[theProperties]) < 0) {
              theAbilityHash[theProperties].push(theName);
            }
          }
        }
      }
    }
  }
  for (let theLevel in theHash) {
    let theSet = [...new Set(theHash[theLevel])];
    theHash[theLevel] = theSet;
  }
  let theNewSet = {};
  let count     = 0;
  for (let theLevel in theHash) {
    theHash[theLevel].forEach(function (property) {
      let theArray = [theLevel, property];
      theNewSet[count] = theArray;
      count++;
    });
  }
  let theNewHash = {};
  let newHashCount = 0;
  for (let theKey in theHash) {
    let theProperty = theKey;
    let theProperties = theHash[theKey];
    let theFilteredSet = theProperties.map(i => theFilteredLHS(i));
    let theCloneSet = {};
    theFilteredSet.forEach(property => {
      if (theCloneSet[property] === undefined) {
        theCloneSet[property] = 0;
      }
      if ($.inArray(theFilteredLHS(property), theFilteredSet) >= 0) {
        theCloneSet[property]++;
      }
    });
    let theNewArray = {};
    let uniqueArray = {};
    theProperties.forEach(property => {
      let theFilteredProperty = theFilteredLHS(property);
      if (theCloneSet[theFilteredProperty] > 1) {
        if (theNewArray[theFilteredProperty] === undefined) {
          theNewArray[theFilteredProperty] = [property];
        } else {
          theNewArray[theFilteredProperty].push(property);
        }
      } else {
        uniqueArray[property] = true;
      }
    });
    let theCombinedArrays = {};
    Object.keys(theNewArray).forEach(outerKey => {
      let combinedArray = [];
      let combinedArrayCount = 0;
      Object.keys(theNewArray).forEach(innerKey => {
        if (innerKey !== outerKey) {
          let outerArray = theNewArray[outerKey];
          let innerArray = theNewArray[innerKey];
          if (combinedArray.length < 1) {
             combinedArray = outerArray.map((i, j) => [i, innerArray[j]]);
          } else {
            let combinedArray2 = outerArray.map((i, j) => [i, innerArray[j]]);
            combinedArray = combinedArray.concat(combinedArray2);
          }
        }
      });
      for (let theArray in combinedArray) {
        theCombinedArrays[combinedArrayCount] = combinedArray[theArray];
        combinedArrayCount++;
      }
    });
    if (Object.keys(theCombinedArrays).length > 0) {
      for (let theArray in theCombinedArrays) {
        theNewHash[newHashCount] = [theKey, ...Object.keys(uniqueArray), ...theCombinedArrays[theArray]];
        newHashCount++;
      }
    } else {
      let theArray = theNewArray[Object.keys(theNewArray)[0]];
      if (theArray === undefined) {
        theNewHash[newHashCount] = [theKey, ...Object.keys(uniqueArray)];
        newHashCount++;
      } else {
        for (let theProperty in theArray) {
          theNewHash[newHashCount] = [theKey, ...Object.keys(uniqueArray), theArray[theProperty]];
          newHashCount++;
        }
      }
    }
  }
  let theSpatialHash = {};
  let theNonSpatialHash = {};
  Object.keys(theNewHash).forEach(i => {
    theSpatialHash[i] = theNewHash[i].filter(j => $.inArray(j, Object.keys(theSpatialProperties)) >= 0);
  });
  Object.keys(theNewHash).forEach(i => {
    if (theNewHash[i].some(j => $.inArray(j, Object.keys(theSpatialProperties)) < 0)) {
      theNonSpatialHash[i] = theNewHash[i];
    }
  });
  let theSpatialCloneCount = [...new Set(Object.keys(theSpatialProperties).map(i => theFilteredLHS(i)))].length;
  let theClones = combineTheHash(theSpatialHash, theSpatialCloneCount);
  for (let theClone in theClones) {
    for (let theNonSpatials in theNonSpatialHash) {
      let theProperties = theNonSpatialHash[theNonSpatials];
      let theMatchers = theProperties.filter(i => $.inArray(i, Object.keys(theSpatialProperties)) >= 0);
      if (theMatchers.every(i => $.inArray(i, theClones[theClone]) >= 0)) {
        let whatToPush = theProperties.filter(i => $.inArray(i, Object.keys(theSpatialProperties)) < 0);
        theClones[theClone].push(...whatToPush);
        whatToPush.forEach(i => {
          if ($.inArray(theFilteredLHS(i), theClonesToPrint) < 0) {
            theClonesToPrint.push(i);
          }
        });
      }
    }
  }
  for (let theClone in theClones) {
    theClones[theClone].forEach(clone => {
      let abilities = theAbilityHash[clone];
      if (abilities !== undefined) {
        abilities.forEach(ability => {
          if ($.inArray(ability, theClones[theClone]) < 0) {
            theClones[theClone].push(ability);
          }
          if ($.inArray(theFilteredLHS(ability), theClonesToPrint) < 0) {
            theClonesToPrint.push(theFilteredLHS(ability));
          }
        });
      }
    });
  }
  let theSortedClones = {};
  let newCount        = 0;
  let theFixedClones = fixTheClones(theClones);
  return theFixedClones;
}

function getAllTheProperties(theNode, theName, allAbilityNodes) {
  if (allAbilityNodes === undefined) {
    allAbilityNodes = theNode.getElementsByTagName(anAbilityNode);
  }
  let theChildren = theNode.children;
  for (let theChild of anArrayContaining(theChildren)) {
    if (isAPropertyNode(theChild)) {
      let theChildName = theNameOf(theChild);
      let whatToPush   = theFullRecords(theNode);
      let theRecord    = theTextContentOf(theChild);
      if(theEntities[theRecord] !== undefined) {
        if (thePropertyTypeOf(theChild) === aSpatialProperty) {
          whatToPush.push(...theRecord.split(aDot));
        }
      }
      getTheNonRecordSiblings(theNode, theChildName);
      if (theCommonProperties[theChildName] === undefined) {
        theCommonProperties[theChildName] = whatToPush;
      } else {
        theCommonProperties[theChildName].push(...whatToPush);
      }
    }
    getAllTheProperties(theChild, theName, allAbilityNodes);
  }
}

function getTheNonRecordSiblings(theNode, theChildName) {
  if (theNode   !== null) {
    let theAunts = $(theNode).siblings().get();
    for (let theClone in theAunts) {
      let theAunt = theAunts[theClone];
      if (theAunt !== null) {
        let theProperties = theAunt.children;
        let theAuntName   = theNameOf(theAunt);
        for (let theProperty of anArrayContaining(theProperties)) {
          let theCousin = theNameOf(theProperty);
          if (theSiblingSpatials[theChildName] === undefined) {
            theSiblingSpatials[theChildName] = [];
          }
          if ($.inArray(theCousin, theSiblingSpatials[theChildName]) < 0
             && theCousin !== theChildName) {
            theSiblingSpatials[theChildName].push(theCousin);
          }
        }
      }
    }
  }
}

function combineTheHash(testClones, cloneCount) {
  let testClones1 = {};
  for (let theOuter in testClones) {
    for (let theInner in testClones) {
      if (theOuter !== theInner) {
        let theOuterSet = testClones[theOuter];
        let theInnerSet = testClones[theInner];
        let matches = 0;
        theOuterSet.forEach(i => $.inArray(i, theInnerSet) ? matches++ : matches = matches);
        if (matches == theInnerSet.length) {
          let theArray = [... new Set(theOuterSet.concat(theInnerSet))];
          let theFilteredSet = [... new Set(theArray.map(i => theFilteredLHS(i)))];
          if (theArray.length == theFilteredSet.length) {
            testClones1[theArray.sort().join()] = true;
          }
        }
      }
    }
  }
  let testCount = 0;
  let theNewSet = {};
  Object.keys(testClones1).forEach(key => {
    theNewSet[testCount] = key.split(',').sort();
    testCount++;
  });
  if (Object.keys(theNewSet).every(i => theNewSet[i].length == cloneCount)) {
    return theNewSet;
  } else {
    return combineTheHash(theNewSet, cloneCount);
  }
}

function theFullRecords(theRecord) {
  let theConstruction;
  let theName     = theNameOf(theRecord);
  theConstruction =
      $(theRecord).parents().map(function () {
          return this.getAttribute(itsName);
      }).get().reverse();
  theConstruction.push(theName);
  theConstruction.forEach(function(object) {
  });
  return theConstruction;
}

function thePowerSet(theList, theLength, isTheAbilitySet) {
  let set = [],
  listSize = theList.length,
  combinationsCount = (1 << listSize);
  for (let i=1; i<combinationsCount; i++){
    let combination = [];
    for (let j=0; j<listSize; j++){
      if ((i & (1 << j))){
        combination.push(theList[j]);
      }
    }
    if(combination.length == theLength) {
      if (isTheAbilitySet && combination.length>1) {
        if(!combinationHasCopies(combination)) {
          set.push(combination);
        }
      } else {
        set.push(combination);
      }
    }
  }
  return set;
}

function setTheClonedAbilitySets(theXML) {
  let theAbilitySetNodes  = theXML.querySelectorAll(anAbilitySetNode);
  let theSets             = {};
  for (let theAbilitySetNode of anArrayContaining(theAbilitySetNodes)) {
    let theName           = theNameOf(theAbilitySetNode);
    let theAbilitySetRefs = theAbilitySetNode.children;
    let theList           = [];
    theSets[theName]      = [];
    for (let theAbilityRef   of anArrayContaining(theAbilitySetRefs))  {
      let theRefName      = theNameOf(theAbilityRef);
      let theQuantity     = theQuantityAttributeOf(theAbilityRef);
      let theClones       = Object.keys(theClonedAbilities[theRefName]);
      if (theClones !== undefined) {
        let theRefList = [theRefName].concat(theClones);
        theList.push(thePowerSet(theRefList, theQuantity, false));
      } else {
        theList.push([[theRefName]]);
      }
    }
    let theSetsToPrint = [].concat.apply([], theList);
    let theSetNumber   = theList.length;
    let thePowerSets   = thePowerSet(theSetsToPrint, theSetNumber, true);
    setTheClonedAbilityRefs(theXML, theAbilitySetNode, thePowerSets);
  }
}

function setTheClonedAbilityRefs(theXML, theNode, theSets) {
  for (let theSet in theSets) {
    let theRefList   = theSets[theSet];
    let theClonedSet = theNode.cloneNode(false);
    let theNewName   = theNameOf(theNode) + underscore + theSet;
    theClonedSet.setAttribute(itsName, theNewName);
    for (let theRefs in theRefList) {
      for (let theRef in theRefList[theRefs]) {
        let theRefName   = theRefList[theRefs][theRef];
        let theChildRef  = theXML.createElement(anAbilityRefNode);
        theChildRef.setAttribute(itsName, theRefName);
        theClonedSet.appendChild(theChildRef);
      }
    }
    theNode.insertAdjacentElement(insertAfter, theClonedSet);
  }
  theNode.parentNode.removeChild(theNode);
}

function setTheDirectionAttributes(theAffordanceNodes) {
  for (let theAffordanceNode of anArrayContaining(theAffordanceNodes)) {
    let theAffordanceProperties = theAffordanceNode.children;
    for (let theAffordanceProperty of anArrayContaining(theAffordanceProperties)) {
      insertTheDirections(theAffordanceProperty);
    }
  }
}

function insertTheDirections(theAffordanceProperty) {
  let theProperty = thePropertyReferenceOf(theAffordanceProperty);
  if ($.inArray(theProperty, Object.keys(theSpatialProperties)) >= 0) {
    let theText           = theTextContentOf(theAffordanceProperty);
    let theTokenStart     = theText.indexOf(aBlankSpace);
    if (theTokenStart < 0 && theText.length > 1) {
      let theTopology     = theText.replace(hyphen,underscore);
      if (theTopology.length > 1) {
        theListOfTopologies[theTopology] = true;
      }
      theAffordanceProperty.textContent +=
        aBlankSpace + allTheDirections[0];
        theListOfDirections[allTheDirections[0]] = true;
      for (let i=allTheDirections.length-1; i>0; --i) {
        let theClone = theAffordanceProperty.cloneNode(false);
        theClone.textContent += theTopology + aBlankSpace + allTheDirections[i];
        theAffordanceProperty.insertAdjacentElement(insertAfter,theClone);
        let theDirection = allTheDirections[i];
        theListOfDirections[theDirection] = true;
      }
    } else {
      let theDirectionEnd  = theText.length;
      let theDirection     =
        theText.substring(theTokenStart + 1, theDirectionEnd)
          .replace(hyphen,underscore);
      if (theDirection.length > 1) {
        theListOfDirections[theDirection] = true;
      }
      let theTopologyStart = theText[0];
      let theTopology      =
        theText.substring(theTopologyStart, theTokenStart)
          .replace(hyphen,underscore);
      if (theTopology.length > 1) {
        theListOfTopologies[theTopology] = true;
      }
    }
  }
}

function setTheClonedConstraintOf(theNode, isAnAffordanceConstraint) {
  let theNewRefs;
  let theRefs;
  let theText;
  let theName;
  let theTag;
  if (isAnAffordanceConstraint) {
    theName        = thePropertyReferenceOf(theNode);
    switch(theNode.nodeName) {
      case anEnvironmentInputNode:
      if ($.inArray(theName, Object.keys(theSpatialProperties)) < 0) {
        theTag     = theTagOf(theName);
        setTheNumericalConstraint(theNode, theName, theTag);
      }
      break;
      case anAbilityInputNode:
        let theMovements = theNode.children;
        let theAbility   = theFilteredLHS(theName);
        let theEntity    = theClonedAbilities[theAbility][theName][1];
        for (let theMovement of anArrayContaining(theMovements)) {
          theText        = theMovement.textContent;
          theRefs        = theFilteredText(theText);
          theNewRefs     = theText.split(notAWord);
          theRefs.forEach(function(theRef) {
             let theClones   = theClonedProperties[theRef];
             for (let theClone in theClones) {
               let theEntityRef     = theClones[theClone][1];
               if (theEntity === theEntityRef) {
                 theNewRefs[theNewRefs.indexOf(theRef)] = theClone;
               } else {
                 let theEntityArray = theEntity.split(aDot);
                 let theRefArray    = theEntityRef.split(aDot);
                 let isSuperset     = theRefArray.every(function(element) {
                   return theEntityArray.indexOf(element) >= 0;
                 });
                 if (isSuperset) {
                   theNewRefs[theNewRefs.indexOf(theRef)] = theClone;
                 }
               }
             }
          });
          let theNewConstraint = theNewRefs.join(aBlank);
          theMovement.textContent = theNewConstraint;
        }
      break;
    }
  } else {
    theName        = theNameOf(theNode);
    theTag         = theTagOf(theName);
    if (isANumericalProperty(theNode)) {
        setTheNumericalConstraint(theNode, theTag);
    }
  }
}

function getThePairedSpatials() {
  let thePairedProperties = {};
  let count = 0;
  Object.keys(theSpatialPairs).forEach(i => {
    Object.keys(theSpatialPairs).forEach(j => {
      if (theFilteredLHS(i) !== theFilteredLHS(j)) {
        if (theSpatialPairs[i].sort().join() === theSpatialPairs[j].sort().join()) {
          thePairedProperties[count] = [i, j].sort();
          count++;
        }
      }
    });
  });
  return thePairedProperties;
}

function setTheNumericalConstraint(theNode, theTag) {
  let theText    = theNode.textContent;
  let theNewRefs = theFilteredText(theText);
  let theRefs    = theText.split(notAWord);
  theNewRefs.forEach(function(theNewRef) {
    theRefs.forEach(function(theRef) {
     if (theFilteredLHS(theNewRef) === theFilteredLHS(theRef)) {
       let theTaggedRef   = theNewRef + theTag;
      if (!theRefs[theRefs.indexOf(theRef)].match(theBooleanValues)) {
         theRefs[theRefs.indexOf(theRef)] = theTaggedRef;
       }
      }
    });
  let theConstraint = theRefs.join(aBlank);
  theNode.textContent = theConstraint;
  });
}

var theTextContentOf = function(theNode) {
  return theNode.textContent;
}

var thePropertyTypeOf = function(theNode) {
  return theNode.getAttribute(itsType);
}

var theFullRecord = function(theNode) {
  let theName         = theNameOf(theNode);
  let theConstruction =
    $(theNode).parents().map(function() {
    return this.getAttribute(itsName);
  }).get().reverse();
  theConstruction.push(theName);
  return theConstruction.join(aDot);
}

var theNameOf = function(theNode) {
  return theNode.getAttribute(itsName);
}

var thePropertyReferenceOf = function(theNode) {
  if(theNode.nodeName !== anEnvironmentOutputNode) {
    return theNode.getAttribute(anInputAttribute);
  } else {
    return theNode.getAttribute(anOutputAttribute);
  }
}

var theQuantOpAttributeOf = function(theNode) {
  return theNode.getAttribute(aQuantOpAttribute);
}

var theEvolutionOf         = function(theNode) {
  return theNode.getAttribute(anEvolutionAttribute);
}

var isAConstantProperty    = function(theNode) {
  let theEvolution = theNode.getAttribute(anEvolutionAttribute);
    if (theEvolution !== effectedByNothing) {
      return false;
    } else {
      return true;
    }
  }

var isANumericalProperty   = function(theNode) {
  if (thePropertyTypeOf(theNode) !== aSpatialProperty) {
    return true;
  } else {
    return false;
  }
}

 var theNewConstraint = function(theRef, theText) {
   let theNewText = theText;
   for (let theExpression in theEnvironmentExpressions) {
     let theRecord    =  theEnvironmentExpressions[theExpression][1] +
          anEnvironmentProperty + theEnvironmentExpressions[theExpression][0];
     if(theExpression === theRef) {
       let theEvolution = theEnvironmentExpressions[theRef][3];
       if (theEvolution !== effectedByNothing) {
         theNewText = theText.replace(theRef, theInitialEnvironment + theRecord);
       }
     }
   }
   return theNewText;
 }

  var theFilteredText = function(theText) {
    let theReturn = theText.split(thePropertyReferences).filter(function(s) {
      return s !== aBlank && $.inArray(s, theLogicalOperators)<0
    });
    return theReturn;
  }

var theFilteredConstraint = function(theText) {
  let theReturn = theText.split(theConstraintReferences).filter(function(s) {
    return s !== aBlank && $.inArray(s, theLogicalOperators)<0
  });
  return theReturn;
}

function combinationHasCopies(theCombinations) {
  let yesItDoes      = false;
  let theIterator    = theCombinations[Symbol.iterator]();
  for (let theCombination of theIterator) {
    if (theFilteredLHS(theCombination[0]) ===
        theFilteredLHS(theIterator.next().value[0])) {
      yesItDoes = true;
      break;
    }
  }
  return yesItDoes;
}

var theNewEntityFor  = function(whatToMove, theClone) {
  let theEntityArray = whatToMove.split(aDot);
  let theOriginal    = theFilteredLHS(theClone);
  let theIndex       = theEntityArray.indexOf(theOriginal);
  theEntityArray[theIndex]
                     = theClone;
  return theEntityArray.join(aDot);
}

var theFilteredLHS   = function(theLHS, isAConstraint) {
  let theReturnString;
  let notNull = theLHS !== undefined && theLHS !== null;
  if(notNull && !isAConstraint) {
    theReturnString = theLHS.replace(underscoreChars, aBlank);
  } else if(notNull && isAConstraint) {
    theReturnString = theLHS.replace(underscoreGlobal, aBlank);
  } else {
    theReturnString = theLHS;
  }
  return theReturnString;
}

var theFilteredExpression = function(theLHS) {
  if(theLHS !== undefined && theLHS !== null) {
    let theStrippedLHS = theLHS.replace(underscoreChars, aBlank);
    return theStrippedLHS;
  } else {
    return theLHS;
  }
}

var isTheEnvironmentNode = function(theNode) {
  if (theNode.nodeName === anEnvironmentNode) {
    return true;
  } else {
    return false;
  }
}

var isAnObjectNode = function(theNode) {
  if(theNode.nodeName === anEnvironmentObjectNode) {
    return true;
  } else {
    return false;
  }
}

var isNotAnAbilitySetNode = function(theNode) {
  if(theNode.parentNode.nodeName !== anAbilitySetNode) {
    return true;
  } else {
    return false;
  }
}

var isAnEnvironmentInputNode = function(theNode) {
  if(theNode.nodeName === anEnvironmentInputNode) {
    return true;
  } else {
    return false;
  }
}

var isAnAbilityNode= function(theNode) {
  if(theNode.nodeName === anAbilityNode ||
     theNode.nodeName === anAbilityRefNode) {
    return true;
  } else {
    return false;
  }
}

var isAnAbilityInputNode= function(theNode) {
  if(theNode.nodeName === anAbilityInputNode) {
    return true;
  } else {
    return false;
  }
}


var isAPropertyNode = function(theNode) {
  if(theNode.nodeName === aPropertyNode) {
    return true;
  } else {
    return false;
  }
}

var isTheHumanNode = function(theNode) {
  if(theNode.nodeName === theHumanNode) {
    return true;
  } else {
    return false;
  }
}

var anArrayContaining = function(someNonArrayObject) {
  return Array.from(someNonArrayObject);
}

var whatTheHumanCanMove = function(theAbility) {
  return theAbility.getAttribute(toMove);
}

var theValueOf = function(theAttribute) {
  return theAttribute.nodeValue;
}

var theOperatorOf = function(theNode) {
  return theNode.getAttribute(mustBe);
}

var theLastDotSeparatedObject = function(theObjectKeyRef) {
  if(theObjectKeyRef.includes(aDot)) {
    let theStringStart = theObjectKeyRef.lastIndexOf(aDot) + 1;
    let theStringEnd   = theObjectKeyRef.length;
    return theObjectKeyRef.substring(theStringStart, theStringEnd);
  } else {
    return theObjectKeyRef;
  }
}

var theParentObjectOf = function(theObjectKeyRef) {
  let theHierarchy   = theObjectKeyRef.split(aDot);
  return theHierarchy[theHierarchy.length-2];
}

function theMovableObjectParent(theObjectKeyRef) {
  let theHierarchy   = theObjectKeyRef.split(aDot);
  theHierarchy.pop();
  for (let theParent in theHierarchy) {
    theMovableParents[theHierarchy[theParent]] = true;
  }
}

// auxilliary cavemenWriter functions

var theIndentation = function(theDepth) {
  return new Array(theDepth).join(twoSpaceIndentation);
}

var thereIsAConstraintIn = function(theDetails) {
  if(theDetails === aSpatialProperty || theDetails === aNumericalProperty) {
    return false;
  } else {
    return true;
  }
}

function hasMovableChild(environmentEntity) {
  for (let theParent in theMovableParents) {
    if (theParent === environmentEntity) {
      return true;
    }
  }
}

var theClosingFor   = function(theRecordDepth) {
  let theClosing    = aBlank;
  for (let theDepth = theRecordDepth - 1; theDepth > 1; theDepth--) {
    theClosing     += new Array(theDepth).join(twoSpaceIndentation);
    theClosing     += recordClosing;
    if (theDepth > 2) {
      theClosing += newLine;
    } else {
      theClosing += semicolonThenNewLine;
    }
  }
  return theClosing + newLine;
}

function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

function theParentQuantityOf(theChild) {
  let theParent = theChild.parentNode;
  if (theParent.attributes.length > 1) {
    return theParent.getAttribute(aQuantityAttribute);
  } else {
    return 0;
  }
}

function theQuantityAttributeOf(theNode) {
  return theNode.getAttribute(aQuantityAttribute);
}

var areThereMoreProperties = function(theEnvironment) {
  let yesThereAre = false;
  let theSubObjects      = Object.assign({}, theEnvironment);
  let theKeys            = Object.keys(theSubObjects);
  for (let i = 0; i<theKeys.length; i++) {
    let theKey = theKeys[i];
    let theNextKey = theKeys[i+1];
    if (Number.isInteger(theKey) && theNextKey !== undefined) {
      if(isNaN(theNextKey)) {
        yesThereAre = true;
        break;
      }
    }
  }
  return yesThereAre;
}

function isAnIntermediateAffordance(theAffordance) {
  let theArrayOfAffordances     = Object.keys(theAffordances);
  if (theAffordance           !==
        theArrayOfAffordances[theArrayOfAffordances.length] &&
      theAffordance           !==
        theArrayOfAffordances[0]) {
    return true;
  } else {
    return false;
  }
}

function isAnExpression(theName) {
  let theExpressionArray =
    [].concat.apply([], Object.entries(theEnvironmentExpressions));
  if($.inArray(theName, theExpressionArray) >= 0) {
    return true;
  } else {
    return false;
  }
}

function isAnIntermediateConstraint(theConstraint, theConstraints) {
  if (theConstraint !== theConstraints[theConstraints.length-1]) {
    return true;
  } else {
    return false;
  }
}

function isTheFirstConstraint(theConstraint, theConstraints) {
  if (theConstraint === theConstraints[0]) {
    return true;
  } else {
    return false;
  }
}

function breakTheLongConstraint(theConstraint, hasNoneOperator) {
  let theOperator = aBlank;
  if (hasNoneOperator) {
    theOperator   = NOT;
  }
  if (theConstraint.length >= 100) {
    return newLine + twoTabs + theOperator   +
      openParenthesis        + theConstraint;
  } else {
    return theOperator + openParenthesis     + theConstraint;
  }
}

function breakTheLongValue(theValue, hasNoneOperator) {
  let theClosing = aBlank;
  if (hasNoneOperator) {
    theClosing   = closeParenthesis;
  }
  if (theValue.length >= 100) {
    return newLine  + threeTabs + twoSpaceIndentation + theValue + theClosing;
  } else {
    return theValue + theClosing;
  }
}

function theOperator(theConstraint) {
  switch(theConstraint) {
    case equalTo:
      return equalsSign;
      break;
    case notEqualTo:
      return neq;
      break;
    case lessThan:
      return lt;
      break;
    case greaterThan:
      return gt;
      break;
    case lessThanOrEqualTo:
      return leq;
      break;
    case greaterThanOrEqualTo:
      return geq;
      break;
  }
}

function aBooleanMovement(theBoolean) {
  return aConstrainedBoolean + theBoolean +
         theFunctionClosing;
};
function aNumericalMovement(theNumber) {
  return aConstrainedReal    + theNumber  +
         theFunctionClosing;
};

function theExpressionFormat(theContents, theConstraint) {
  if (theConstraint) {
    return openParenthesis  +  theContents[0]  +
           closeParenthesis + equalsSign       +
           theContents[1];
  } else {
    return openParenthesis  + theContents[0] +
           closeParenthesis + equalsSign     +
           aZero;
    }
  }

function getEXACTLYConstraintsFor(theAffordance, theLHS, theRHS, theEquality, theNumber, theObject) {
  let theCount     = 1;
  let theDepth     = theCloneDepth[theObject];
  let itPrinted    = {};
  for (let theClone in theAffordances) {
    let theOpening             = aBlank;
    let theClosing             = aBlank;
    if (theClone !== theAffordance) {
      for (let theCloneConstraints in theAffordances[theClone]) {
        if (theCount >= theNumber) {
          theOpening = aConjunction + twoTabs + NOTparenthesis;
          theClosing = closeParenthesis;
        } else {
          theOpening = aConjunction + twoTabs;
        }
        let theCloneConstraint =
            theAffordances[theClone][theCloneConstraints][0];
        if (theFilteredLHS(theCloneConstraint) === theFilteredLHS(theLHS)
            && theCloneConstraint !== theLHS) {
          if (itPrinted[theCloneConstraint] === undefined) {
            itPrinted[theCloneConstraint] = false;
          }
          let theOriginals;
          let theOldRecord;
          if (theCloneConstraint.includes(theInitialAbility)) {
            theOriginals = flatten(theCloneConstraint.split(aDot).map(i => i.indexOf(openParenthesis) > 0 ?
                i.substring(0, i.indexOf(closeParenthesis)).split(openParenthesis) : i));
            theOldRecord = flatten(theLHS.split(aDot).map(i => i.indexOf(openParenthesis) > 0 ?
                i.substring(0, i.indexOf(closeParenthesis)).split(openParenthesis) : i));
          } else {
            theOriginals = flatten(theCloneConstraint.split(aDot).map(i => i.indexOf(openSquareBracket) > 0 ?
                i.substring(0, i.indexOf(closeSquareBracket)).split(openSquareBracket) : i));
            theOldRecord = flatten(theLHS.split(aDot).map(i => i.indexOf(openSquareBracket) > 0 ?
                i.substring(0, i.indexOf(closeSquareBracket)).split(openSquareBracket) : i));
          }
          let theProperties = [theOriginals[theOriginals.length - 2], theOldRecord[theOldRecord.length - 2]];
          /*
          let theAssociates = [theOriginals[theOriginals.length - 1], theOldRecord[theOldRecord.length - 1]];
          let theThings     = [theOriginals.slice(0, theOriginals.length - 1).join(aDot),
                               theOldRecord.slice(0, theOldRecord.length - 1).join(aDot)];
          theThings[0] = theThings[0].substring(0, theThings[0].lastIndexOf('_p'));
          theThings[1] = theThings[1].substring(0, theThings[1].lastIndexOf('_p'));
          if (theAssociates[1] !== theAssociates[0] && theThings[0] === theThings[1]) {
            theAffordanceFunction += theOpening +
                theCloneConstraint + theOperator(theEquality) +
                theRHS + theClosing;
          }*/
          theProperties[0] = theProperties[0]
              .substring(theProperties[0].lastIndexOf(underscore), theProperties[0].length);
          theProperties[1] = theProperties[1]
              .substring(theProperties[1].lastIndexOf(underscore), theProperties[1].length);
          let theLHSObject = theLHS.substring(0, theLHS.indexOf(openSquareBracket));
          let theNewObject = theCloneConstraint.substring(0, theCloneConstraint.indexOf(openSquareBracket));
          if (theFilteredLHS(thePropertyHash[theLHSObject]) ===
            theFilteredLHS(thePropertyHash[theNewObject]) &&
            theProperties[0] === theProperties[1] &&
            !itPrinted[theCloneConstraint]) {
            theAffordanceFunction += theOpening +
                theCloneConstraint + theOperator(theEquality) +
                theRHS + theClosing;
            theCount++;
            itPrinted[theCloneConstraint] = true;
          }
        }
      }
    }
  }
  theAffordanceFunction     += closeParenthesis;
}

function getATLEASTConstraintsFor(theAffordance, theLHS, theRHS, theEquality, theNumber, theObject) {
  let theCount   = 1;
  for (let theClone in theAffordances) {
    let theOpening             = aBlank;
    let theClosing             = aBlank;
    if (theClone !== theAffordance) {
      for (let theCloneConstraints in theAffordances[theClone]) {
        if (theCount == 1) {
          theOpening = aConjunction + threeTabs + openParenthesis;
        }
        if (theCount > theNumber) {
          theOpening = aConjunction + twoTabs;
          theClosing = closeParenthesis;
        } else {
          theOpening = aConjunction + threeTabs;
        }
        let theCloneConstraint =
            theAffordances[theClone][theCloneConstraints][0];
        if (theFilteredLHS(theCloneConstraint) === theFilteredLHS(theLHS)
            && theCloneConstraint !== theLHS) {
          theOpening = aConjunction + threeTabs;
          let theOriginals;
          let theOldRecord;
          let theProperties = [];
          if (theCloneConstraint.includes(theInitialAbility)) {
            theOriginals = flatten(theCloneConstraint.split(aDot).map(i => i.indexOf(openParenthesis) > 0 ?
                i.substring(0, i.indexOf(closeParenthesis)).split(openParenthesis) : i));
            theOldRecord = flatten(theLHS.split(aDot).map(i => i.indexOf(openParenthesis) > 0 ?
                i.substring(0, i.indexOf(closeParenthesis)).split(openSquareBracket) : i));
          } else {
            theOriginals = flatten(theCloneConstraint.split(aDot).map(i => i.indexOf(openSquareBracket) > 0 ?
                i.substring(0, i.indexOf(closeSquareBracket)).split(openSquareBracket) : i));
            theOldRecord = flatten(theLHS.split(aDot).map(i => i.indexOf(openSquareBracket) > 0 ?
                i.substring(0, i.indexOf(closeSquareBracket)).split(openSquareBracket) : i));
          }
          let count = 0;
          theOriginals.forEach(i => {if ($.inArray(i, theOldRecord) >= 0) count++});
          theProperties = [theOriginals[theOriginals.length - 2], theOldRecord[theOldRecord.length - 2]];
          theProperties[0] = theProperties[0]
              .substring(theProperties[0].lastIndexOf(underscore), theProperties[0].length);
          theProperties[1] = theProperties[1]
              .substring(theProperties[1].lastIndexOf(underscore), theProperties[1].length);
          if (theCount <= theNumber && theProperties[0] === theProperties[1]) {
            theAffordanceFunction += theOpening +
                theCloneConstraint + theOperator(theEquality) +
                theRHS + theClosing;
            theCount++;
            count = 0;
          }
        }
      }
    }
  }
  theAffordanceFunction     += closeParenthesis;
}

function getATMOSTConstraintsFor(theAffordance, theLHS, theRHS, theEquality, theNumber, theObject) {
  let theCount   = theNumber;
  for (let theClone in theAffordances) {
    let theOpening             = aBlank;
    let theClosing             = aBlank;
    if (theClone !== theAffordance) {
      for (let theCloneConstraints in theAffordances[theClone]) {
        if (theCount == 1) {
          theOpening = aConjunction + threeTabs + openParenthesis;
        }
        if (theCount > theNumber) {
          theOpening = aConjunction + twoTabs;
          theClosing = closeParenthesis;
        } else {
          theOpening = aConjunction + threeTabs;
        }
        let theCloneConstraint =
            theAffordances[theClone][theCloneConstraints][0];
        if (theFilteredLHS(theCloneConstraint) === theFilteredLHS(theLHS)
            && theCloneConstraint !== theLHS) {
          theOpening = aConjunction + threeTabs;
          let theOriginals;
          let theOldRecord;
          let theProperties = [];
          if (theCloneConstraint.includes(theInitialAbility)) {
            theOriginals = flatten(theCloneConstraint.split(aDot).map(i => i.indexOf(openParenthesis) > 0 ?
                i.substring(0, i.indexOf(closeParenthesis)).split(openParenthesis) : i));
            theOldRecord = flatten(theLHS.split(aDot).map(i => i.indexOf(openParenthesis) > 0 ?
                i.substring(0, i.indexOf(closeParenthesis)).split(openSquareBracket) : i));
          } else {
            theOriginals = flatten(theCloneConstraint.split(aDot).map(i => i.indexOf(openSquareBracket) > 0 ?
                i.substring(0, i.indexOf(closeSquareBracket)).split(openSquareBracket) : i));
            theOldRecord = flatten(theLHS.split(aDot).map(i => i.indexOf(openSquareBracket) > 0 ?
                i.substring(0, i.indexOf(closeSquareBracket)).split(openSquareBracket) : i));
          }
          let count = 0;
          theOriginals.forEach(i => {if ($.inArray(i, theOldRecord) >= 0) count++});
          theProperties = [theOriginals[theOriginals.length - 2], theOldRecord[theOldRecord.length - 2]];
          theProperties[0] = theProperties[0]
              .substring(theProperties[0].lastIndexOf(underscore), theProperties[0].length);
          theProperties[1] = theProperties[1]
              .substring(theProperties[1].lastIndexOf(underscore), theProperties[1].length);
          if (theCount >= theNumber && theProperties[0] === theProperties[1]) {
            theAffordanceFunction += theOpening +
                theCloneConstraint + theOperator(theEquality) +
                theRHS + theClosing;
            theCount--;
            count = 0;
          }
        }
      }
    }
  }
  theAffordanceFunction     += closeParenthesis;
}

function getALLConstraintsFor(theAffordance, theLHS, theRHS, theEquality) {
  let theCount  = 1;
  let printIt   = {};
  printIt[theLHS] = true;
  for (let theClone in theAffordances) {
    let theOpening             = aBlank;
    let theClosing             = aBlank;
    if (theClone !== theAffordance) {
      for (let theCloneConstraints in theAffordances[theClone]) {
        let theCloneConstraint =
            theAffordances[theClone][theCloneConstraints][0];
        if (theFilteredLHS(theCloneConstraint) === theFilteredLHS(theLHS)) {
          theOpening = aConjunction + threeTabs;
          let theOriginals;
          let theOldRecord;
          let theProperties = [];
          if (theCloneConstraint.includes(theInitialAbility)) {
            theOriginals = flatten(theCloneConstraint.split(aDot).map(i => i.indexOf(openParenthesis) > 0 ?
                i.substring(0, i.indexOf(closeParenthesis)).split(openParenthesis) : i));
            theOldRecord = flatten(theLHS.split(aDot).map(i => i.indexOf(openParenthesis) > 0 ?
                i.substring(0, i.indexOf(closeParenthesis)).split(openSquareBracket) : i));
          } else {
            theOriginals = flatten(theCloneConstraint.split(aDot).map(i => i.indexOf(openSquareBracket) > 0 ?
                i.substring(0, i.indexOf(closeSquareBracket)).split(openSquareBracket) : i));
            theOldRecord = flatten(theLHS.split(aDot).map(i => i.indexOf(openSquareBracket) > 0 ?
                i.substring(0, i.indexOf(closeSquareBracket)).split(openSquareBracket) : i));
          }
          let count = 0;
          theOriginals.forEach(i => {if ($.inArray(i, theOldRecord) >= 0) count++});
          theProperties = [theOriginals[theOriginals.length - 2], theOldRecord[theOldRecord.length - 2]];
          theProperties[0] = theProperties[0]
              .substring(theProperties[0].lastIndexOf(underscore), theProperties[0].length);
          theProperties[1] = theProperties[1]
              .substring(theProperties[1].lastIndexOf(underscore), theProperties[1].length);
          if (theProperties[0] === theProperties[1] && !printIt[theCloneConstraint]) {
            theAffordanceFunction  += theOpening              +
                theCloneConstraint + theOperator(theEquality) +
                theRHS + theClosing;
            theCount++;
            printIt[theCloneConstraint] = true;
            count = 0;
          }
        }
      }
    }
  }
  theAffordanceFunction     += closeParenthesis;
}

function getALLEffectsFor(theLHS, theRHS, theEquality, theObject) {
  theObject    = theFilteredLHS(theObject);
  let theCount = 1;
  let theDepth = theCloneDepth[theObject];
  for (let theClone in theAffordances) {
    for (let theCloneConstraints in theAffordances[theClone]) {
      let theCloneConstraint =
        theAffordances[theClone][theCloneConstraints][0];
        if (theCloneConstraint === theLHS) {
          let theStrippedClone = theFilteredLHS(theCloneConstraint);
          let theStrippedLHS   = theFilteredLHS(theLHS);
          if (theStrippedLHS === theStrippedClone && theCount < theDepth) {
          theModuleDeclaration      += twoTabs +
                 theNextStateVariable(theCloneConstraint) +
                 theOperator(theEquality)   +
                 theRHS + semicolonThenNewLine;;
          theCount++;
        }
      }
    }
  }
}

function getATLEASTEffectsFor(theLHS, theRHS, theEquality, theNumber, theObject) {
  theObject    = theFilteredLHS(theObject);
  let theMin   = parseInt(theNumber);
  let theCount = 1;
  for (let theClone in theAffordances) {
    for (let theCloneConstraints in theAffordances[theClone]) {
      let theCloneConstraint =
        theAffordances[theClone][theCloneConstraints][0];
        let theStrippedClone = theFilteredLHS(theCloneConstraint);
        let theStrippedLHS   = theFilteredLHS(theLHS);
          if (theStrippedLHS === theStrippedClone && theCount < theMin && theCloneConstraint !== theLHS) {
          theModuleDeclaration      += twoTabs +
                 theNextStateVariable(theCloneConstraint) +
                 theOperator(theEquality)   +
                 theRHS + semicolonThenNewLine;;
          theCount++;
        }
      }
    }
}

function getEXACTLYEffectsFor(theLHS, theRHS, theEquality, theNumber, theObject) {
  let theMin   = parseInt(theNumber);
  let theCount = 1;
  let alsoEvolving = [];
  for (let theClone in theAffordances) {
    for (let theCloneConstraints in theAffordances[theClone]) {
      let theCloneConstraint =
        theAffordances[theClone][theCloneConstraints][0];
        let theStrippedClone = theFilteredLHS(theCloneConstraint);
        let theStrippedLHS   = theFilteredLHS(theLHS);
          if (theStrippedLHS === theStrippedClone && theCount < theMin) {
          theModuleDeclaration      += twoTabs +
                 theNextStateVariable(theCloneConstraint) +
                 theOperator(theEquality)   +
                 theRHS + semicolonThenNewLine;;
          theCount++;
        }
      }
    }
  }

function fixTheClones(theClones) {
  for (let theClone in theClones) {
    theClones[theClone].forEach(function(theInput) {
      if (theSpatialPairs[theInput]   !== undefined) {
        theClones[theClone].forEach(function(inner) {
          if (theSpatialPairs[inner] !== undefined && theInput !== inner) {
            if (theSpatialPairs[inner].sort().join() !== theSpatialPairs[theInput].sort().join() &&
                theFilteredLHS(theSpatialPairs[inner].sort().join()) === theFilteredLHS(theSpatialPairs[theInput].sort().join())) {
                let theRightStuff = theSpatialPairs[inner].sort().join();
                for (let theProperty in theSpatialPairs) {
                  if (theSpatialPairs[theProperty].sort().join() === theRightStuff &&
                      theFilteredLHS(theProperty) === theFilteredLHS(theInput)) {
                    let theInputIndex = theClones[theClone].indexOf(theInput);
                    if (theInputIndex > 0) {
                      theClones[theClone].splice(theInputIndex, 1, theProperty);
                    }
                  }
                }
              }
            }
        });
      }
    });
  }
  return theClones;
}

function setTheNewProperty(theOldName, theName, theNode, i) {
  let theTagEnd = Math.floor(Math.random() * (99 - i + 1)) + i;
  theName += theTagEnd;
  let theSet = {};
  if(isAPropertyNode(theNode)) {
    theSet = theClonedProperties;
  } else {
    theSet = theClonedAbilities;
  }
  if (theSet[theOldName][theName] !== undefined){
    setTheNewProperty(theOldName, theName, theNode, i);
  } else {
    theNode.setAttribute(itsName, theName);
    return;
  }
}

function isCommon(theInnerList, theOuterList) {
  let yes = false;
  theInnerList.forEach(function(item) {
    if ($.inArray(item, theOuterList) >= 0) {
      yes = true;
    }
  });
  return yes;
}

function theEntityPossibilitiesIn(theDetails) {
  let thePredicate          = theDetails.replace(dotChars, underscore);
  let theOpening            = aSpatialConstraint;
  return theOpening + thePredicate;
}

function getTheMovementDeclaration(theListOfMovements) {
  let theMovementsToDeclare =
    Object.keys(theListOfMovements).sort().join(commaThenSpace);
  theMovementsDeclaration += theMovementsToDeclare + theEnumeratedTypeEnd;
};

function getTheEntityDeclaration(theEntities) {
  let theEntitiesToDeclare =
    Object.keys(theEntities).sort()
      .join(commaThenSpace).replace(dotChars, underscore);
  theEntitiesDeclaration += theEntitiesToDeclare + theEnumeratedTypeEnd;
};

function getTheConstantDeclaration(theConstant, theValue) {
  theConstantDeclarations += theConstant + aColon + theValue + semicolonThenNewLine;
};

function getTheAffordanceDeclaration(theAffordances) {
  let theAffordancesToDeclare =
    Object.keys(theAffordances).sort().join(commaThenSpace);
  theAffordancesDeclaration += theAffordancesToDeclare + theEnumeratedTypeEnd;
};

function getTheTopologyDeclarations(theListOfTopologies) {
  let theTopologiesToDeclare  = Object.keys(theListOfTopologies);
  if ($.inArray(disjointTo, theTopologiesToDeclare) >= 0) {
    let theOldIndex           = theTopologiesToDeclare.indexOf(disjointTo);
    let theDisjoint           = theTopologiesToDeclare.splice(theOldIndex, 1);
    theTopologiesToDeclare.unshift(theDisjoint);
  } else {
    theTopologiesToDeclare.unshift(disjointTo);
  }
  theTopologiesToDeclare.join(commaThenSpace);
  theTopologiesDeclaration  += theTopologiesToDeclare + theEnumeratedTypeEnd;
}

function getTheDirectionDeclarations(theListOfDirections) {
  let theDirectionsToDeclare =
    Object.keys(theListOfDirections).sort().join(commaThenSpace);
  theDirectionsDeclaration  += theDirectionsToDeclare + theEnumeratedTypeEnd;
}

function getTheAffordanceSpecs() {
  let theVariables             =
    Object.keys(theAffordances).filter(function(s) {
      return !s.includes(underscore)
  });
  let theClonedAffordances     =
    Object.keys(theAffordances).filter(function(s) {
      return s.includes(underscore)
  });
  let theNegativeSafetySpecs   = {};
  let thePositiveSafetySpecs   = {};
  let thePositiveResponseSpecs = {};
  let theNegativeResponseSpecs = {};
  let theObjectValue;
  let theNegativeSafetySpec;
  let thePositiveSafetySpec;
  for (let theVariable in theVariables) {
      theNegativeSafetySpec  = alwaysNOT + openParenthesis +
        theSpecFunction(theVariables[theVariable]);
      thePositiveSafetySpec  = always    +
        theSpecFunction(theVariables[theVariable]);
    for (let theClone in theClonedAffordances) {
      if (theClonedAffordances[theClone].includes(theVariables[theVariable])) {
        theNegativeSafetySpec += OR + newLine + threeTabs +
          theSpecFunction(theClonedAffordances[theClone]);
        thePositiveSafetySpec += OR + newLine + threeTabs +
          theSpecFunction(theClonedAffordances[theClone]);
      }
    }
    theNegativeSafetySpec                        += closeParenthesis;
    theNegativeSafetySpecs[theNegativeSafetySpec] = theVariables[theVariable];
    thePositiveSafetySpecs[thePositiveSafetySpec] = theVariables[theVariable];
  }
  if (theVariables.length > 1) {
    for (let thePositiveSpec in thePositiveSafetySpecs) {
      theVariables                = Object.keys(theAffordances);
      let printTheOpening         = true;
      let thePositiveResponseSpec = thePositiveSpec;
      let theNegativeResponseSpec = thePositiveSpec;
        for (let theVariable in theVariables) {
          let theStrippedVariable    = theFilteredLHS(theVariables[theVariable]);
          let theStrippedRHSVariable =
                          theFilteredLHS(thePositiveSafetySpecs[thePositiveSpec]);
          if (theStrippedVariable    !== theStrippedRHSVariable) {
            if (printTheOpening) {
              thePositiveResponseSpec += implies + newLine + fourTabs + eventually
                                      + theSpecFunction(theVariables[theVariable]);
              theNegativeResponseSpec += implies + newLine + fourTabs +
                        eventuallyNOT + theSpecFunction(theVariables[theVariable]);
              printTheOpening          = false;
            } else {
              thePositiveResponseSpec += OR  + newLine +
                fourTabs + theSpecFunction(theVariables[theVariable])
              theNegativeResponseSpec += OR   + newLine +
                fourTabs + theSpecFunction(theVariables[theVariable])
            }
          }
        }
        thePositiveResponseSpec += closeParenthesis;
        theNegativeResponseSpec += closeParenthesis + closeParenthesis;
        thePositiveResponseSpecs[thePositiveResponseSpec] = true;
        theNegativeResponseSpecs[theNegativeResponseSpec] = true;
      }
    }
  theSpecs = [thePositiveSafetySpecs  , theNegativeSafetySpecs,
              thePositiveResponseSpecs, theNegativeResponseSpecs];
}

function theLocalPredicateFor(theProperty, thePredicate, theConstraint, isType) {
  let theLocal  = theProperty    + noConstraint + theLocalPredicateEnd;
  let theType   = theProperty    + thePredicate + theConstraint   + newLine;
  if (theConstraint.length > 4) {
    theLocal    = openCurlyBrace + anEnvironmentProperty + aColon + theProperty
                                 + thePredicate + theConstraint
                                 + noConstraint + theLocalPredicateEnd;
  } else {
    theType     = theProperty    + noConstraint + thePredicateEnd + newLine;
  }
  if (isType) {
    return theType;
  } else {
    return theLocal;
  }
}

function theTransitionLambda(theAffordance) {
  return theGuardExpressionOpen  +
         theAffordance           +
         theGuardExpressionClose +
         theActualizedOpen       +
         theAffordance           +
         theActualizedClose;
  };

function theNextStateVariable(theRecord) {
  let theNewRecord = theRecord;
  let theIndex = theRecord.indexOf(aDot);
  if(theIndex > 0) {
      theNewRecord = theRecord.replace(
        aDot, aRecordNextState);
  } else {
      theNewRecord = theRecord + nextState;
  }
  return theNewRecord;
}

function getRandomCount(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomLEASTCount(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function theNumericalPropertyBegin(theName, theType) {
  return openCurlyBrace  + theName + aColon + theType;
}

function theSpatialPropertyBegin(theName) {
  return openSquareBracket + openCurlyBrace  + theName + theSpatialType;
}

function theHumanPropertyBegin(theName) {
  theName = theName.replace(dotChars, underscore);
  return openSquareBracket + openCurlyBrace + theName + aColon +
    theHumanPropertyType   + theName        + equalsSign;
}

function pushTheClone(theClone, theArray) {
  let yes = false;
  if ($.inArray(theFilteredLHS(theClone), theArray) >= 0) {
    yes = true;
  }
  return yes;
}

function logicalOperatorThenNewLine(theSet, theOperator) {
  return theOperator                    +
  new Array(theSet).join(aTab)
}

function getTheLastObjectDepth(theObject) {
  return printed[theObject][1];
}

function theSpecFunction(theAffordance) {
  return theGuardExpressionOpen         +
    theAffordance + theSpecFunctionClose;
 }

function thePrintedSpec(theSpec, theNumber) {
  return aSpec + theNumber  + aColon    +
         theSpecDeclaration + theSpec   +
         closeParenthesis   +
         semicolonThenNewLine;
 }

 var theModuleClosing = function(whatToPrint) {
  return '\t[]ELSE -->\n' + whatToPrint + '\n\t];\n  END;\n';
 }
// global string variables
var theEnvironmentDeclaration   = 'X: TYPE = \n';
var theHumanDeclaration         = 'Z: TYPE = \n';
var theMovementsDeclaration     = 'movements: TYPE = {';
var theEntitiesDeclaration      = 'entity: TYPE = {';
var theDirectionsDeclaration    = 'direction: TYPE = {';
var theTopologiesDeclaration    = 'topology: TYPE = {';
var theAffordancesDeclaration   = 'h: TYPE = {';
var theConstantDeclarations     = '';
var theSpecDeclarations         = '';
var theSpatialDeclaration       = 'spatial: TYPE = [entity -> ARRAY direction OF topology];\n\n';
var theAbilitySetsDeclaration   = 'abilitySets: [Z -> BOOLEAN] = '+
                                  'LAMBDA(Z_q: Z): \n\t';
var theAffordanceFunction       = 'possesses: [h -> [[X, Z] -> BOOLEAN]] = ' +
                                   'LAMBDA(affordance: h): \n\t  IF';
var theModuleDeclaration        = `
  W_pq: MODULE =
    BEGIN
      GLOBAL Z_q: Z
      GLOBAL X_p: X
`;

// global non-string variables
var theAffordanceNodes;
var theEnvironmentNode;
var theHumanNode;
var theAbilityNodes;
var theMovables                 = [];
var theClonedAbilityNodes       = [];
var evolvingEffectsToPrint      = {};
var allTheSpatialConstraints    = {};
var theAbilityRefs              = {};
var thePropertiesDepth          = {};
var theConstantProperties       = {};
var theEvolvingEnvironment      = {};
var theEntities                 = {};
var theListOfMovements          = {};
var theListOfTopologies         = {};
var thePropertyHash             = {};
var theListOfDirections         = {};
var theMovableParents           = {};
var theAbilityExpressions       = {};
var theEnvironmentExpressions   = {};
var theAffordances              = {};
var theAffordanceEffects        = {};
var theHumanToPrint             = {};
var theSpatialProperties        = {};
var theClonedProperties         = {};
var theClonedSpatialProperties  = {};
var theCommonProperties         = {};
var theCloneRecordQuantities    = {};
var theClonedAbilities          = {};
var theCloneDepth               = {};
var theSpatialPairs             = {};
var theSiblingSpatials          = {};
var printed                     = {};
var theEnvironmentDepth         = 1;
var theLastObjectDepth          = 0;
var theDepthOfTheRecord         = 0;
var theFlattenedDepth           = 0;
var thePropertyDepth            = 0;
var thereAreAbilitySets         = false;
var addNullProp                 = false;

// Regex and tokens
const thePropertyReferences   = /[^a-zA-Z+]/;
const theConstraintReferences = /[^a-zA-Z0-9_+]/;
const theArithmeticOperators  = /[\*|\-|\+|\/]/;
const notAWord                = /([\W+])/;
const theNumberedLHS          = /[a-zA-Z+]_[0-9+]/;
const theBooleanValues        = /\s*(true|TRUE|false|FALSE)\s*/;
const insertAfter             = 'afterend';
const underscoreChars         = /[_0-9+]/g;
const underscoreGlobal        = /^(?:(?!_p).)+$/g;
const numericalChars          = /[0-9+]/;
const dotChars                = /\./g;
const theGlobalTag            = 'g';
const hyphen                  = '-';

// XML element nodes
const theRootNode             = 'hes';
const anEnvironmentNode       = 'environment';
const anEnvironmentObjectNode = 'entity';
const aHumanNode              = 'human';
const anAbilityNode           = 'ability';
const anAbilityRefNode        = 'ability-ref';
const anAbilitySetNode        = 'ability-set';
const aPropertyNode           = 'property';
const anEnvironmentInputNode  = 'environment-input';
const anEnvironmentOutputNode = 'environment-output';
const anAbilityInputNode      = 'human-input';
const anAffordanceNode        = 'affordance';

// XML attributes
const toMove                  = 'entity';
const mustBe                  = 'equality-operator';
const aSpatialProperty        = 'spatial';
const aNumericalProperty      = 'numerical';
const itsName                 = 'name';
const itsType                 = 'type';
const aQuantityAttribute      = 'quantity';
const aQuantOpAttribute       = 'quantity-operator';
const anInputAttribute        = 'name';
const anOutputAttribute       = 'name';
const anEvolutionAttribute    = 'evolution';

// XML attribute values
const greaterThan             = 'greater-than';
const equalTo                 = 'equal-to';
const notEqualTo              = 'not-equal-to';
const lessThan                = 'less-than';
const all                     = 'all';
const any                     = 'any';
const exactly                 = 'exactly';
const atLeast                 = 'at_least';
const atMost                  = 'at_most';
const none                    = 'none';
const effectedByHuman         = 'human';
const effectedByEnvironment   = 'environment';
const effectedByNothing       = 'none';
const greaterThanOrEqualTo    = 'greater-than-or-equal-to';
const lessThanOrEqualTo       = 'less-than-or-equal-to';
const lowercaseTrue           = 'true';
const lowercaseFalse          = 'false';
const uppercaseTrue           = 'TRUE';
const uppercaseFalse          = 'FALSE';
const disjointTo              = 'disjoint_to';
const theLogicalOperators     = ['AND', 'and', 'OR', 'or', 'XOR', 'xor'];
const allTheDirections        = ['right_of' , 'left_of' , 'top_of',
                                 'bottom_of', 'front_of', 'back_of'];

// SAL strings
const theBeginning              = 'cavemen: CONTEXT = \nBEGIN \n\n';
const theRecordTypeOpening      = '[#';
const aColon                    = ': ';
const aComma                    = ',';
const anEnvironmentProperty     = '_p';
const aHumanProperty            = '_q';
const underscore                = '_';
const theEnd                    = '\nEND';
const recordClosing             = '#]';
const theSpatialType            = ': entity'
const verticalBar               = ' | ';
const theSpatialPropertyEnd     = '} -> ARRAY direction OF topology]';
const thePredicateEnd           = '}';
const theFunctionClosing        = '}]';
const openCurlyBrace            = '{';
const openParenthesis           = '(';
const openSquareBracket         = '[';
const closeSquareBracket        = ']';
const closeParenthesis          = ')';
const equalsSign                = ' = ';
const theEnumeratedTypeEnd      = '};\n\n';
const theLocalPredicateEnd      = '};\n';
const aBlank                    = '';
const commaThenNewLine          = ',\n';
const commaThenSpace            = ', ';
const colonThenNewLine          = ':\n';
const semicolonThenNewLine      = ';\n';
const twoSpaceIndentation       = '  ';
const aTab                      = '\t';
const twoTabs                   = '\t\t';
const threeTabs                 = '\t\t\t';
const fourTabs                  = '\t\t\t\t';
const aBlankSpace               = ' ';
const newLine                   = '\n'
const aDot                      = '.';
const closeParenthesesSemicolon = ');'
const aSpatialConstraint        = 'with_respect_to = ';
const noConstraint              = ' | TRUE';
const theHumanPropertyType      = 'movements | '
const BOOLEAN                   = 'boolean';
const REAL                      = 'real';
const INTEGER                   = 'integer';
const aConstrainedBoolean       = ' -> {q: BOOLEAN | q = ';
const aConstrainedReal          = ' -> {q: REAL | q >= 0 AND q <= ';
const aReferencedBooleanAbility = ' -> BOOLEAN]';
const aReferencedNumberAbility  = ' -> REAL]';
const anXORdisjunction          = ' XOR\n\t';
const aConjunction              = ' AND\n\t'
const anImplication             = ' =>\n\t'
const anORdisjunction           = ' OR\n\t';
const OR                        = ' OR ';
const AND                       = ' AND ';
const NOT                       = 'NOT';
const NOTparenthesis            = 'NOT(';
const aRealNumber               = ': REAL';
const aZero                     = '0';
const theLocalAbilitiesValue    = 'abilitySets';
const theGlobalAbilities        = 'Z_q';
const theGlobalEnvironment      = 'X_p';
const theNextStateAbility       = 'Z_q\'.';
const theNextStateEnvironment   = 'X_p\'.';
const theInitialAbility         = 'Z_q.';
const theInitialEnvironment     = 'X_p.';
const affordanceEquals          = ' affordance = ';
const theActualized             = 'actualized: ARRAY h OF BOOLEAN\n';
const theInitActualized         = '\t\t(FORALL(a: h): actualized[a] = false);\n'
const theLambda                 = '(LAMBDA (X_p: X, Z_q: Z):\n\t'
const THEN                      = ' THEN ';
const ELSIF                     = ' ELSIF ';
const ENDIF                     = ' ENDIF;\n'
const lt                        = ' < ';
const gt                        = ' > ';
const leq                       = ' <= ';
const geq                       = ' >= ';
const neq                       = ' /= ';
const nextState                 = '\'';
const aRecordNextState          = '\'.';
const localP                    = '_p: ';
const IN                        = ' IN ';
const GLOBAL                    = ' GLOBAL ';
const LOCAL                     = ' LOCAL ';
const INITIALIZATION            = ' INITIALIZATION ';
const TRANSITION                = ' TRANSITION ';
const aGuard                    = '[]';
const theGuardExpressionOpen    = 'possesses(';
const theGuardExpressionClose   = ')(X_p, Z_q) --> \n';
const theActualizedOpen         = '\t\t actualized\'['
const theActualizedClose        = '] = true;\n'
const theSpecFunctionClose      = ')(X_p, Z_q)';
const theLocalIndent            = '     '
const implies                   = ' => ';
const theSpecDeclaration        = ' THEOREM W_pq |- ';
const theAffordanceClosing      = '\tELSE (LAMBDA (X_p: X, Z_q: Z): false)' +
                                  ' ENDIF;\n';
const theSpecs                  =
`positiveAR: THEOREM W_pq |-
                      NOT(F(FORALL(a: desired): actualized[a]) AND
                        G(FORALL(y: undesired): NOT(possesses(y)(X_p, Z_q))));

 negativeAR: THEOREM W_pq |-
                    F(FORALL(a: desired): actualized[a]) AND
                      G(FORALL(y: undesired): NOT(possesses(y)(X_p, Z_q)));`;
