
// Defines parameters for running

module.exports = {
  // Information about the Rubric for the current assignment
  rubric: {
    template: "./samples/rubric-sample0.md.hbs",
    fileName: "<%= submissionDir %>/RUBRIC.md"
  },

  // Location where the student projects were extracted to, there should be a folder per
  // student in here
  submissionDir: "./path/to/projects",

  // Date when the assignment is due, usually copied from Sakai
  dueDate: "27-Jan-2017 23:55",

  late: {
    // How many days late are allowed
    days: 2,

    // Percentage taken off of a mark per day
    penaltyPerDay: 0.20
  }
};
