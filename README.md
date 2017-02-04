# Sakai Marking Helper

This script was written for SE2205 TAs for marking, it has been open sourced 
because it is useful to modify for your own purposes. 

## Install

1. Install nodejs: https://nodejs.org/en/
2. Install `yarn`: https://yarnpkg.com/docs/install
3. Clone the project: `git clone git@github.com:Nava2/sakai-github-education-marking-helper.git`
4. Change to the project directory: `cd ./sakai-github-education-marking-helper`
3. Run `yarn install`

## Running

Before using any built-in commands, do the following: 

1. Download your assignment from Sakai: 
    ![Download All from Sakai](./download-all.gif)
2. Unzip the assignment and get the folder, e.g. "C:\Users\John\Downloads\bulk_download\Lab 00"
3. Copy the due date of the assignment, e.g. "27-Jan-2017 23:55"
4. Open [`./config.js`](./config.js) and modify the parameters within, **read all of the parameters**.

### Downloading Sources

In the project's directory, run: `yarn download`

Within each student directory, there will be a `meta.json` which looks like: 

```json
{
  "studentId": "kbright2",
  "studentDirectory": "C:\\Users\\kevin\\Downloads\\Test Assignment - 00\\Brightwell, Kevin(kbright2)",
  "warnings": [],
  "rawSubmission": "<p>git@github.com:uwoece-se2205b-2017/lab-00-introduction-Nava2.git</p>",
  "cloneDirectory": "C:\\Users\\kevin\\Downloads\\Test Assignment - 00\\Brightwell, Kevin(kbright2)\\submission-kbright2",
  "gitUri": "git@github.com:uwoece-se2205b-2017/lab-00-introduction-Nava2.git",
  "submission": {
    "commit": {
      "hash": "f3b85c3b9cfce92ed5a0af1c0b7d4cd4d0de6212",
      "date": "December 30th 2016, 08:43:20 -0500"
    },
    "sakaiDate": "February 4th 2017, 08:53:54 -0500",
    "late": "5 days",
    "penalty": 1
  }
}
```


### Marking Assignments

The students code will be cloned into a folder called: `submission-$studentId` 
(e.g. `submission-kbright2`) for the above student. Within the `submission` folder, there is a rubric file named
as defined in [`./config.js`](./config.js), likely `RUBRIC.md`. Modify this with the marks for the assignment. 

Once a mark is known, update the `grades.csv` or `grades.xlsx` file in your extracted folder. Be mindful to apply any 
penalties computer. 

### Uploading to OWL

Running `yarn package` will create a zip file called: `for-sakai.zip` in the extraction directory. This file can be used
with the "Upload All" option on Sakai. Save your `grades.csv` before running the script. 

### Pushing Rubrics to Github

To push the rubrics to Github, run: `yarn submit`. This moves through each repository, committing the `RUBRIC.md` file 
and then pushes the changes to Github. There is a delay of 200 ms between each push, this is expected. 
