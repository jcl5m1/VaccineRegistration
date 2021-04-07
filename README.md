# Vaccine Registration Tool

This project is a free lightweight mobile-friendly web tool for registering, scheduling, notifying, managing, and reporting COVID-19 vaccinations. It attempts to provide a digital workflow reducing the burden of manual paperwork and process for small/medium vaccination clinics that may not have the IT infrastructure to build thier own tools. Centralized infrastructure can be challenging to access, use, adapt and may not account for onsite workflows.  As vaccination distribution grows, these tools hope to help smaller clinics operate more efficiently allowing more vacinations per staff.  As technology or transportion limited individuals become a larger percentage of the target population, staff responsiblies will only increase taking time away from administering vaccinations.

It only requires a free Google account to host the project using Google Sheets as the database, Google Drive to store images, and Gmail for messages.  All of the data is stored in (and most of the configuration can be done by editting) a Google Sheet. This means the data is easily edittable and exportable to other EMR systems. It is built using [App Script](https://developers.google.com/apps-script) to automatically create web forms/pages for creating, displaying, and updating data in the spreadsheet. Photos of ID cards can be caputred using the mobile phone camera, stored in Google Drive, and are associated with patient records.

If [Google Cloud Vision Services](https://cloud.google.com/vision) are enabled on your hosting account, it can also perform text recognition on insurance cards and photo IDs for much faster (and less error prone) check-in process.  This service is free for the first 1000 queries/month, with a [modest cost for additional queries/month](https://cloud.google.com/vision/pricing).

You can play with a [early prototype instance of the tool](https://script.google.com/macros/s/AKfycbxqX4NDfrTFaTn25ilzazqobWwMPT1IKzxHUdJBnnWPI3pjZ2tAV615d7vwLxT2H0Ls-g/exec).  It is under VERY active development.

## Setup your own instance

TBD.
