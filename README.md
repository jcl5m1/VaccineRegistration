# Vaccine Registration Tool

This project is a free lightweight web tool for registering, scheduling, notifying, managing, and reporting for COVID-19 vaccinations. It attempts to create a digital workflows to help reduce the paperwork burden for small/medium vaccination clinics that may not have the IT infrastructure to build thier own tools.  It only requires a free Google account to host the project using Google Sheets as the database, Google Drive to store images, and Gmail for messages.  All of the data is stored in (and most of the configuration can be done by editting) a Google Sheet. This means the data is easily exportable and edittable. It is build using [App Script](https://developers.google.com/apps-script) to automatically create web forms/pages for creating, displaying, and updating data in the spreadsheet. Photos of ID cards can be caputred using the mobile phone camera, stored in Google Drive, and are associated with patient records.

If [Google Cloud Vision Services](https://cloud.google.com/vision) are enabled on your hosting account, it can also perform text recognition on insurance cards and photo IDs for much faster (and less error prone) check-in process.  This service is free for the first 1000 queries/month, with a [modest cost for additional queries/month](https://cloud.google.com/vision/pricing).

You can play with a [early prototype instance of the tool](https://script.google.com/macros/s/AKfycbxqX4NDfrTFaTn25ilzazqobWwMPT1IKzxHUdJBnnWPI3pjZ2tAV615d7vwLxT2H0Ls-g/exec).  It is under VERY active development.

#Setup your own instance

TBD.
