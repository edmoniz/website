
/* 
  Author: Ed Moniz
  Student ID: T00444190
  Date:   November 2025
  COMP2681 Capstone Project

  Filename: countdown.js 
*/

// global variable to store the single end date string
const END_DATE_STRING = 'Dec 18 2025 00:00:00';
const END_DATE = new Date(END_DATE_STRING);

// The 'updateBirthdayAndCountdown' function is no longer needed 
// as the date is fixed and not selected.

function updateCountdown() {
  const now = new Date();

  // check if the end date has already passed
  if (END_DATE < now) {
    document.getElementById('days').textContent = '0';
    document.getElementById('hrs').textContent = '0';
    document.getElementById('mins').textContent = '0';
    document.getElementById('secs').textContent = '0';
    // Optionally display a message
    const countdownBlock = document.getElementById('countdownBlock');
    if (countdownBlock) {
      countdownBlock.innerHTML = '<h2>🎉 Course Completed! 🎉</h2>';
      countdownBlock.style.color = 'green';
    }
    // stop the interval if the course is over
    return;
  }

  // Calculate the difference in milliseconds between the fixed end date and now
  const timeDifference = END_DATE.getTime() - now.getTime();

  // calculations for days, hours, minutes and seconds
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const daysLeft = Math.floor(timeDifference / day);
  const hrsLeft = Math.floor((timeDifference % day) / hour);
  const minsLeft = Math.floor((timeDifference % hour) / minute);
  const secsLeft = Math.floor((timeDifference % minute) / second);

  // get countdown display elements
  const countdownBlock = document.getElementById('countdown'); // Assumed ID based on HTML
  const dateNowElement = document.getElementById('dateNow');

  // update the countdown numbers
  document.getElementById('days').textContent = daysLeft;
  document.getElementById('hrs').textContent = hrsLeft;
  document.getElementById('mins').textContent = minsLeft;
  document.getElementById('secs').textContent = secsLeft;

  // determine color based on the time left (simplified color logic for course end)
  let color = 'blue';
  if (daysLeft < 30) {
    color = 'red'; // Less than a month left: ALERT!
  } else if (daysLeft <= 90) {
    color = 'darkorange'; // Less than 3 months left: Warning
  } else {
    color = 'green'; // More than 3 months left: Good amount of time
  }

  // apply the determined color to the main countdown container
  if (countdownBlock) {
    countdownBlock.style.color = color;
  }

  // display current date and time
  if (dateNowElement) {
    // format time as desired
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = {
      hour: '2-digit', minute: '2-digit',
      second: '2-digit', hour12: false
    };
    const datePart = now.toLocaleDateString(undefined, dateOptions);
    const timePart = now.toLocaleTimeString(undefined, timeOptions);
    dateNowElement.innerHTML = `Current Date - ${datePart}&nbsp;&nbsp;&nbsp;${timePart}`;
  }
}

// setup logic
window.addEventListener('DOMContentLoaded', function () {
  // run on load with the fixed date
  updateCountdown();
  // run the function every second to update the countdown
  setInterval(updateCountdown, 1000);
});