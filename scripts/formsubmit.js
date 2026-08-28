
/*
   Author: Ed Moniz
   November 2025 (updated August 2026)
   EdMonizPhotography Website
   Filename: formsubmit.js

   The contact form now posts directly to FormSubmit.co, which relays the
   submission to ed@edmonizphotography.com and then redirects the visitor to
   thankyou.html. Browser-native HTML5 validation still guards the required
   fields, so this script only handles small UI niceties.
*/

window.addEventListener('DOMContentLoaded', function () {
   const resetButton = document.getElementById('resetButton');
   const submitButton = document.getElementById('submitButton');

   // Drop the focus outline after a mouse click on either button.
   if (resetButton) {
      resetButton.addEventListener('mouseup', function () {
         this.blur();
      });
   }

   if (submitButton) {
      submitButton.addEventListener('mouseup', function () {
         this.blur();
      });
   }
});
