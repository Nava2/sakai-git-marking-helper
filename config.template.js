
// Do not change this line vvvv
module.exports = {
// DO not change this line ^^^^

  // This file is a template, copy this file and name it `config.js`. Do not modify this file directly.

  // Modify the following per project:

  // Name of the marker, this is written into the Rubric usually
  marker: "John Smith",

  // Information about the Rubric for the current assignment
  rubric: {
    // Where the template for the rubric is, this should be provided by an instructor
    // This path is relative to this project
    templatePath: "./samples/rubric-sample0.md.hbs",

    // Where to place the rubric file, the path is not relative, however useful variables are:
    // cloneDirectory -> Where the student's repository is cloned to
    // studentDirectory -> The folder the student's submission is in
    submissionPath: "<%= cloneDirectory %>/RUBRIC.md"
  },

  // Add files that are used in Marking, these files will not be committed when calling `submit`
  // "from" is the local path where the file exists
  // "to" is the path to place the file.
  markingFiles: [
    {
      from: "/path/to/package/MarkingTests.java",
      to: "<%= cloneDirectory %>/src/test/java/path/to/package/MarkingTests.java"
    }
  ],

  // Name of the grades file, usually just using the CSV or XLSX
  gradesFileName: 'grades.csv',

  // Location where the student projects were extracted to, there should be a folder per
  // student in here. If you're on windows, you will have to use two \\ characters to separate paths.
  extractedDirectory: "/path/to/extracted/files",

  // Date when the assignment is due, usually copied from Sakai
  dueDate: "27-Jan-2017 23:55",

  late: {
    // How many days late are allowed
    days: 2,

    // Percentage taken off of a mark per day
    penaltyPerDay: 0.20
  }

// DO NOT MODIFY BELOW vvv
};
