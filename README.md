# Sakai Marking Helper

This script was written for SE2205 TAs for marking, it has been open sourced 
because it is useful to modify for your own purposes. 

## Install

1. Install nodejs: https://nodejs.org/en/
2. Install `yarn`: `npm install -g yarn`
3. Run `yarn install`

## Running

Before using any built-in commands, do the following: 

1. Download your assignment from Sakai: 
    ![Download All from Sakai](./download-all.gif)
2. Unzip the assignment and get the folder, e.g. "C:\Users\John\Downloads\bulk_download\Lab 00"
3. Copy the due date of the assignment, e.g. "27-Jan-2017 23:55"
4. Open [`./config.js`](./config.js) and modify the parameters within

### Downloading Sources

In this project's directory, run: `yarn run download`

Within each student directory, there will be a `meta.json` which looks like: 

```json
{
  "studentId": "jsmith2",
  "gitUri": "git@github.com:uwoece-se2205b-2017/lab-00-introduction-jsmith2.git",
  "owlDate": "2017-01-16T16:44:00.200Z",
  "submission": {
    "hash": "f3b85c3b9cfce92ed5a0af1c0b7d4cd4d0de6212",
    "date": "2016-12-31T01:43:20.000Z",
    "late": "-27 days",
    "penalty": 0
  }
}
```

Additionally, a rubric file will be created for marking purposes. Feel free to also 
modify the assignment itself as students will see changes you make in their repository. 
