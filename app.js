'use strict';

import fs from 'fs';
import parse from 'csv-parse';
import stringify from 'csv-stringify';

const inputFile = process.argv[2];
const input = fs.createReadStream(inputFile);

let lineNumber = 0;
let documentsList = [];
let documentTopicRelations = [];

const parser = parse();
parser.on('readable', () => {
  let record;
  while(record = parser.read()) {

    switch (lineNumber) {
      case 1:
        extractAllDocumentNames(record);
        break;
      case 2:
        extractActors(record);
        break;
      case 3:
        extractForDocuments('url')(record);
        break;
      case 4:
        extractForDocuments('year')(record);
        break;
      case 5:
        extractForDocuments('natureOfDocument')(record);
        break;
      case 6:
        extractForDocuments('statusOfDocument')(record);
        break;
      case 7:
        extractForDocuments('natureOfActor')(record);
        break;
      case 8:
        extractForDocuments('natureOfProcess')(record);
        break;
      case 9:
        extractForDocuments('scopeOfDocument')(record);
        break;
    }

    if (lineNumber > 10) {
      extractDocumentTopics(record);
    }

    lineNumber += 1;
  }
});

parser.on('finish', () => {
  buildNodeCSV();
  buildEdgeCSV();
});

const extractAllDocumentNames = function (record) {
  documentsList = record.slice(2).map((r) => ({
    name: r.trim()
  }));
};

const extractActors = function (record) {
  record.slice(2).forEach((r, i) => {
    documentsList[i].actors = r.trim().split(',').map(a => a.trim());
  });
}

const extractForDocuments = prop => record => {
  record.slice(2).forEach((r, i) => {
    documentsList[i][prop] = r.trim();
  });
};

const extractDocumentTopics = function (record) {
  var topicName = record[0];
  record.slice(2).forEach((r, i) => {
    var section = r.trim();
    if (r !== '') {
      documentTopicRelations.push({
        document: documentsList[i].name,
        topic: topicName,
        section: section
      });
    }
  });
};

const buildNodeCSV = function() {
  const output = [];
  const stringifier = stringify({
    header: true,
    columns: [
      'Type',
      'Name',
      'Description',
      'Image',
      'Reference',
      'Year',
      'Nature of Document',
      'Status of Document',
      'Nature of Actor',
      'Nature of Process',
      'Scope of Document'
    ]
  });
  stringifier.on('readable', () => {
    let row;
    while(row = stringifier.read()) {
      output.push(row);
    }
  });
  stringifier.on('error', (e) => {
    console.log(e.message);
  });
  stringifier.on('finish', () => {
    fs.writeFile('data/nodes.csv', output.join(''), 'utf-8');
  });

  documentsList.forEach((d) => {
    stringifier.write([
      'Document', // type
      d.name, // name
      '', // description
      '', // image
      d.url, // reference,
      d.year, // year
      d.natureOfDocument,
      d.statusOfDocument,
      d.natureOfActor,
      d.natureOfProcess,
      d.scopeOfDocument
    ]);
  });
  stringifier.end();
};

const buildEdgeCSV = function() {
  const output = [];
  const stringifier = stringify({
    header: true,
    columns: [
      'From Type',
      'From Name',
      'EDGE TYPE',
      'To Type',
      'To Name',
      'Weight',
      'Reference'
    ]
  });

  stringifier.on('readable', () => {
    let row;
    while(row = stringifier.read()) {
      output.push(row);
    }
  });

  stringifier.on('error', (e) => {
    console.log(e.message);
  });

  stringifier.on('finish', () => {
    fs.writeFile('data/edges.csv', output.join(''), 'utf-8');
  });

  documentTopicRelations.forEach((r) => {
    stringifier.write([
      'Document',
      r.document,
      'ADDRESSES',
      'Topic',
      r.topic,
      1,
      r.section
    ]);
  });

  documentsList.forEach((r) => {
    r.actors.forEach((a) => {
      stringifier.write([
        'Actor',
        a,
        'ACTED_IN',
        'Document',
        r.name,
        1,
        ''
      ]);
    });
  });
  stringifier.end();
};

input.pipe(parser);
