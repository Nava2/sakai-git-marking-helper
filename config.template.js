
// Do not change this line vvvv
module.exports = {
// DO not change this line ^^^^

  // This file is a template, copy this file and name it `config.js`. Do not modify this file directly.

  // Modify the following per project:

  // Name of the marker, this is written into the Rubric usually
  marker: "John Smith",

  // Add files that are used in Marking, these files will not be committed when calling `submit` unless "keep" is set
  // to `true`. For example, use `keep: true` for Rubrics.
  //
  // hbs files will automatically be run through Handlebars
  //
  // "from" is the local path where the file exists
  // "to" is the path to place the file.
  // Parsed variables are available:
  //   cloneDirectory -> Where the student's repository is cloned to
  //   studentDirectory -> The folder the student's submission is in
  markingFiles: [
    {
      from: "./samples/RUBRIC.md.hbs",
      to: "./RUBRIC.md",
      keep: true
    },
    {
      from: "./samples/MarkingTests.java",
      to: "./src/test/java/path/to/package/MarkingTests.java",
      keep: true
    }
  ],

  // Commands allow optional per-student commands to be run. They can be specified as either strings
  // or if the working directory isn't the students cloned directory, they can use the object syntax
  // Each command is run in-order, so dependencies are easily written.
  commands: [
    "gradlew.bat assemble",
    {
      command: "cp ./RUBRIC.md ./submission-<%= studentId %>.md",
      cwd: "<%= studentDirectory %>"
    }
  ],

  // Name of the grades file, usually just using the CSV or XLSX
  gradesFileName: 'grades.csv',

  // Location where the student projects were extracted to, there should be a folder per
  // student in here. If using Windows, you will have to use two \\ characters to separate paths.
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
