
// Defines parameters for running
module.exports = {

  // Name of the marker, this is written into the Rubric usually
  marker: "John Smith",

  // Information about the Rubric for the current assignment
  rubric: {
    templatePath: "./samples/rubric-sample0.md.hbs",
    submissionPath: "<%= cloneDirectory %>/RUBRIC.md"
  },

  // Location where the student projects were extracted to, there should be a folder per
  // student in here. If you're on windows, you will have to use two \\ characters to separate paths.
  extractedDirectory: "path/to/extracted/download/all",

  // Date when the assignment is due, usually copied from Sakai
  dueDate: "27-Jan-2017 23:55",

  late: {
    // How many days late are allowed
    days: 2,

    // Percentage taken off of a mark per day
    penaltyPerDay: 0.20
  }
};
