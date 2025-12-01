
/* 
   Author: Ed Moniz 
   November 2025 
   COMP2681 Assignment 3 and 4
   Filename: em_formsubmit.js
*/
    
window.onload = function () {
   updateClock();
   setInterval(updateClock, 1000);
}

/* This section is for assignment three */
window.onload = function () {
   if (document.forms.length > 0) {
      document.forms[0].onsubmit = function () {
         if (this.checkValidity()) {
            alert("No invalid data detected. Will retain data for further testing.");
         }
         return false;
      };
   }
   const resetButton = document.getElementById('resetButton');
   const submitButton = document.getElementById('submitButton');

   if (resetButton) {
      resetButton.addEventListener('mouseup', function () {
         // this.blur() removes the focus outline after the click
         this.blur();
      });
   }

   if (submitButton) {
      submitButton.addEventListener('mouseup', function () {
      this.blur();
      });
   }
};

