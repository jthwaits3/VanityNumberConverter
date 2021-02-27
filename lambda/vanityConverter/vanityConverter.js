const { DynamoDB } = require('aws-sdk');
const Trie = require('trie');
const wordDictionary = require('./words.js');

exports.handler = async function(event, context, callback) {
  console.log("request:", JSON.stringify(event, undefined, 2));

  const caller = event.Details.ContactData.CustomerEndpoint.Address;
  let trimmedCallerArray = caller.substring(caller.length-10,caller.length).split('');
  const vanityNumbers = generateVanityNumbers(trimmedCallerArray);
  var resultMap = {
    callingNumber: caller,
    vanity0: vanityNumbers[0],
    vanity1: vanityNumbers[1],
    vanity2: vanityNumbers[2],
    vanity3: vanityNumbers[3],
    vanity4: vanityNumbers[4]
  }
  const dynamoDocClient = new DynamoDB.DocumentClient();
  let params = {
    TableName : process.env.VANITY_TABLE_NAME,
    Item: resultMap
  };
  await dynamoDocClient.put(params, function(err, data) {
    if (err) console.log(err);
    else console.log(data);
  }).promise();

  callback(null, resultMap)
};


function generateVanityNumbers(phoneArray) {
  var wordsMatrix = generateWordsMatrix(phoneArray);
  let vanityNumbers = new Array();
  for (let i=0; i<phoneArray.length; i++) {

    /* Below block can be refactored as a recursive function to extend beyond 2 words and reduce depth of loops*/
    for (let j=wordsMatrix[i].length; j>-1; j--) {
      if (wordsMatrix[i][j]) {
        for (let word of wordsMatrix[i][j]) {
          let wordSplit = word.split('');
          let vanity1=phoneArray.map(el=>el);
          let score = 0;
          let dashCount=0;
          vanity1.splice(i,wordSplit.length,...wordSplit);
          if (i+wordSplit.length<phoneArray.length && i>0) {
            vanity1.splice(i,0,'-');
            vanity1.splice(wordSplit.length+i+1,0,'-');
            dashCount+=2;
          } else if (i+wordSplit.length<phoneArray.length) {
            vanity1.splice(wordSplit.length+i,0,'-');
            score++;
            dashCount++;
          } else if (i>0) {
            vanity1.splice(i,0,'-');
            score++;
            dashCount++;
          } else {
            score+=2;
          }
          score+=word.length;
          vanityNumbers.push({
            vanityNumber: vanity1,
            score: score
          });
          for (let k=i+word.length; k<phoneArray.length-1; k++) {
            for (let l=wordsMatrix[k].length; l>-1; l--) {
              if (wordsMatrix[k][l]) {
                for (let word2 of wordsMatrix[k][l]) {
                  let wordSplit2 = word2.split('');
                  let vanity2=vanity1.map(el=>el);
                  if (k>i+wordSplit.length) { //Prefix dash
                    if (k+wordSplit2.length+dashCount<vanity1.length) { //suffix dash
                      vanity2.splice(k+dashCount,wordSplit2.length,...wordSplit2);
                      vanity2.splice(k+dashCount+wordSplit2.length,0,'-');
                      vanity2.splice(k+dashCount,0,'-');
                    } else { //No suffix dash
                      vanity2.splice(k+dashCount,wordSplit2.length,...wordSplit2);
                      vanity2.splice(k+dashCount,0,'-');
                    }
                  } else { //No prefix dash
                    if (k+wordSplit2.length+dashCount<vanity1.length) { //suffix dash
                      vanity2.splice(k+dashCount,wordSplit2.length,...wordSplit2);
                      vanity2.splice(k+dashCount+wordSplit2.length,0,'-');
                    } else { //No suffix dash
                      vanity2.splice(k+dashCount,wordSplit2.length,...wordSplit2);
                    }
                  }
                  score+=word2.length;
                  vanityNumbers.push({
                    vanityNumber: vanity2,
                    score: score
                  });
                }
              }
            }
          }
        }
      }
    }
  }
  vanityNumbers.sort((a, b)=>(b.score-a.score));
  return vanityNumbers.map(el=>el.vanityNumber.join(''));
  // console.log(vanityNumbers);
}

function generateWordsMatrix(phoneArray) {
  var wordTrie = Trie.createTrieFromArray(wordDictionary);
  // For larger dictionaries it would be beneficial to dump the tree as a JSON one time and load as below:
  // var wordTrie = new Trie.Trie();
  // wordTrie.loadJson(wordDictionaryTrie)

  let numbersToLetters = {
    0: ['0'],
    1: ['1'],
    2: ['A', 'B', 'C'],
    3: ['D', 'E', 'F'],
    4: ['G', 'H', 'I'],
    5: ['J', 'K', 'L'],
    6: ['M', 'N', 'O'],
    7: ['P', 'Q', 'R', 'S'],
    8: ['T', 'U', 'V'],
    9: ['W', 'X', 'Y', 'Z'],
  };

  let wordsMatrix = new Array();

  for (let i=0; i<phoneArray.length; i++) {
    let permuteColumn = new Array();
    let wordColumn = new Array();
    permuteColumn.push(numbersToLetters[phoneArray[i]]);
    for (let j=i+1; j<phoneArray.length; j++) {
      let permuteCell = new Array();
      let wordCell = new Array();
      for (let prevWord of permuteColumn[(j-i-1)]) {
        // let newCharIndex = j+i;
        for (let newChar of numbersToLetters[phoneArray[j]]) {
          let newPermute = prevWord+newChar;
          if (wordTrie.isValidPrefix(newPermute)) {
            permuteCell.push(newPermute);
            if (wordTrie.lookup(newPermute)) {
              wordCell.push(newPermute)
            }
          }
        }
      }
      permuteColumn.push(permuteCell);
      wordColumn.push(wordCell);
    }
    wordsMatrix.push(wordColumn);
  }
  return wordsMatrix;
}
//
// var x = generateVanityNumbers(['8', '2', '2', '5', '8', '2', '2']);
// console.log(x);
