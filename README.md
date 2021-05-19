# Vaccine Registration Tool

> **IMPORTANT:** This project is **not HIPAA compliant**.  However, "[the HHS Office
for Civil Rights (OCR) will not impose penalties for noncompliance with regulatory
requirements under the HIPAA Rules](https://public-inspection.federalregister.gov/2021-03348.pdf?utm_campaign=pi+subscription+mailing+list&utm_source=federalregister.gov&utm_medium=email) against covered health care providers or their business
associates in connection with the good faith use of online or web-based scheduling applications
for the scheduling of individual appointments for COVID-19 vaccinations during the COVID-19
nationwide public health emergency".

This project is a free lightweight mobile-friendly web tool for registering, scheduling, notifying, managing, and filing reports for mass vaccination efforts such as the COVID-19 vaccination.   It attempts to provide a digital workflow reducing the burden of manual paperwork and processes for small/medium vaccination clinics that may not have the IT infrastructure to build thier own tools. Centralized infrastructure can be challenging to access, use, adapt and may not account for onsite workflows.  As vaccination distribution grows, these tools hope to help smaller clinics operate more efficiently allowing more vacinations per staff.  As technology or transportion limited individuals become a larger percentage of the target population, staff responsiblies will only increase taking time away from administering vaccinations.

This tool only requires a free Google account to host the project using Google Sheets as the database, Google Drive to store images, and Gmail for messaging.  All of the data is stored in (and most of the configuration can be done by editting) a Google Sheet. This means the data is easily edittable and exportable to other EMR systems. It is built using [App Script](https://developers.google.com/apps-script) to automatically create web forms/pages for creating, displaying, and updating data in the spreadsheet. Photos of ID cards can be captured using a mobile phone camera, stored in Google Drive, and associated with patient records.

If [Google Cloud Vision Services](https://cloud.google.com/vision) are enabled on your host account, it can also perform text recognition on insurance cards for much faster (and less error prone) check-in process.  The VisionAPI service is free for the first 1000 queries/month, with a [modest cost for additional queries/month](https://cloud.google.com/vision/pricing).

You can play with a [early prototype instance of the tool](https://script.google.com/macros/s/AKfycbyE-oYPWFtNmOr0epXRmwLXghkGDoGR1WiqdH_FhVtB9NLw0yJTulm6vqfbvUcyLep2NA/exec).  It is under VERY active development.

## Setup your own instance

This section is very much work in progress.

This in an [App Script](https://developers.google.com/apps-script) project that runs on Google Docs.  Hosting an instance requires a free Google Account.   You can reuse an account you have. However, this account will be the administrator with full privileges to the data and scripts.  This app will request edit permissions for Drive, Spreadsheets, and Gmail.  If you are not comfortable with that, you may want to create a separate account for hosting this project.  

> **Reminder: This project is not HIPAA compliant**.  It is provided in hopes in may be useful where that is not required. Do not share the Google account creditials with anyone you would not trust to delete or copy the patient information safely.

The (optional, but recommended) steps below use a Chrome extension to help synchronize code with Github.  These instructions assume you are using the [Google Chrome Browser](https://www.google.com/chrome). The App Script IDE does not sync changes between browsers in real-time. Open browser windows on other computers can hold onto an old state of the project.  If you resume editting on an old browser state, **you will overwrite any new edits**. Syncing to Github is recommended for keeping multiple editors in sync.

1. Download and install [Google Chrome Browser](https://www.google.com/chrome)
1. If you don't already have a Google account you want to use as host, you can [create a new Google Account](https://accounts.google.com/signup).
1. (optional, but recommended) Install the [Google App Script Github Assistant](https://chrome.google.com/webstore/detail/google-apps-script-github/lfjcgcmkmjjlieihflfhjopckgpelofo).  Click **add to Chrome**.
1. (optional, but recommended) Github is very useful for saving and managing versions of coding project.  It is recommended, but not required.  If you don't already have a Github account you want to use, create a new [Github account](https://github.com/).  If you are a programmer and want to contribute back to the main project, you can fork this repository rather than copying the AppScript project as instructed below.  This will simplify merging improvements.  However, configuring this is beyond the scope of this README.
1. Create a new folder on Google Drive that you want to be the project's main folder.  Look at the URL for a long string of numbers and letters.  Example: If your folder URL is `'https://drive.google.com/drive/folders/1zOu5qg7VCP4tz1BFyZJDSwGGZmAyflal'`. Your project folder ID is: `'1zOu5qg7VCP4tz1BFyZJDSwGGZmAyflal'`.  You will need this later.
1. Create a copy of this [spreadsheet template](https://docs.google.com/spreadsheets/d/1j5VCDo9ZgxcoMpREO0Qy27rw6loOEWWckPpYNEg_mcI/edit#gid=457942996).  Once you have made a copy, look at the URL for a long string of numbers and letters.  Example, if your spreadsheet URL is: `'https://docs.google.com/spreadsheets/d/163XoWSUqz2MjaMewZEi0hxOEpDFdJgfgfR2SL_0NDco/edit#gid=0'`. Your spreadsheet ID is: `'163XoWSUqz2MjaMewZEi0hxOEpDFdJgfgfR2SL_0NDco'`.  You will need this later.
1. Open this copy of the [AppScript project](https://script.google.com/d/1O38qwdfY_Pycg1hFUm-Ocm7wKxHrqfuI3feZr-7-ci8cVTEX1tTV6AW7/edit?usp=sharing) for this repository.  Click on the 'i' icon in the left panel to see the project overview.  On the upper right, click on 'Make a copy' to create your own copy of this project.  Then click on the title to rename the project to your own. NOTE: If you have multiple Google accounts logged in within a given profile, this may cause an error.  Try this again with only one account logged in.
1. (optional, but recommended) If you've installed the Google App Script Github Assistant, you should see **Repository**, **Branch**, and **Login into SCM** in the menu bar.  Click on **Login to SCM** and follow the instructions to log into Github.  It may ask you for a Github Access Token.  Follow the link to create a new access token with the **repo** scope.  Copy and paste the new token into the login page.  You will directed to approve GasHub to access you account, say Allow. Back in the Google App Script editor, click on **Repository > Create New Repo**.  Then press the **up arrow** in the menu bar to upload your copy of the you AppScript project to your Github account.  It will show you a window called "Diff" showing you the differences in the files.  Scroll to the bottom and add a description like "initial commit" and press **Push**.  In a moment, it will copy all the files in your project to Github for safe keeping and version control allowing your to recover old versions of the code if needed.
1. Open `config.gs`, and you will need to modify `'YOUR_SPREADSHEET_ID'` and `'YOUR_PROJECT_FOLDER_ID'` to be the long string of characters from the previous steps to tell this project what files/directory to use for the project.
1. Click on the file `Code.gs`, and press run.  In a moment, it will say **Authorization Required**.  Click **review permissions**.  Select your host account. It will warn you that "Google hasn't verified this app."  Since this is a custom app of which you are now the developer, this is correct.  You are approving this to make modifications to files in your Google Drive.  Click **Advanced** and **Go to name_of_your_app**.  It will list the edit rights that the application needs to your files (Google Drive, Google Sheets, Gmail, external Vision service, etc) then hit **Allow**.
1. In a moment, it should say `run from editor complete` in the Execution Log.  This means everything went correctly.  If it says `Lost connection`, try running it again.
1.  Now click on **Deploy > New Deployment**, which will create a live instance of the website.  Select Type > Web app.  Add a decription like `"Inital Test"`.  Under **configuration > Web app**, select **Execute as Me** to enable access your account data.  Set **Who has access** to be **Only myself** while you are testing.  Then hit **Deploy**.
1.  Under Web app, you should now see a URL that you can click on, which will open a new tab to the live running Web app.
1.  When doing rapid edits, you can use **Deploy > Test Deployments** to create a web app instance that will refresh everytime you save your changes in the editor.  This avoids having to create a new deployment for each small change you make.
1. (optional, but recommended) If you have the Github assistant installed, you can upload/push your code changes to Github for safe keeping allowing you to roll back code changes in case something happens.  This is particularly valuable if you are using multiple computers to edit the project.  
1.  Once you are ready anyone on the internet to use your Web app, create a New Deployment and set **Who has access** to **Anyone**.  You will get a new URL, that you can now share with others.  You should see data appear in the your Google sheet.

## Setting Up Staff Login with Google Login (OAuth API) 



1. Create a new Project at Google API Console: 
https://console.cloud.google.com/cloud-resource-manager

Name: Vaccine Registration App (Or any name)

<img width="554" alt="Screen Shot 2021-05-15 at 1 52 01 PM" src="https://user-images.githubusercontent.com/1888003/118377358-c931b080-b59a-11eb-82e4-46b4e2e182dd.png">

2.  Click the triple bar menu on the left,  go to APIs & Services, and click Credentials. 
<img width="486" alt="Screen Shot 2021-05-15 at 1 54 25 PM" src="https://user-images.githubusercontent.com/1888003/118377367-d353af00-b59a-11eb-913a-0805b1b93d31.png">

From the drop down click "Create Credentials" and click OAuth Client ID.
<img width="943" alt="Screen Shot 2021-05-15 at 1 38 25 PM" src="https://user-images.githubusercontent.com/1888003/118377369-d77fcc80-b59a-11eb-8a28-bfc06d68dad1.png">


3. Fill out the following and hit create. 

Application type: "Desktop app"

Name: "Vaccine Registration App" (or any name you want)

<img width="552" alt="Screen Shot 2021-05-15 at 1 45 11 PM" src="https://user-images.githubusercontent.com/1888003/118377371-dc448080-b59a-11eb-8afa-6e5b4277a86b.png">


4.  A popup that says "OAuth client created" will appear with your client ID and client secret.
<img width="536" alt="47d3f5ff-b10e-42bc-ac05-ccd176bea799" src="https://user-images.githubusercontent.com/1888003/118377376-e36b8e80-b59a-11eb-883e-36cba7979a38.png">


Copy your Client ID and Client Secret into the file login.service.gs

Replace YOUR_CLIENT_ID and YOUR_CLIENT_SECRET with your pasted ID (within the double quotes).

It should be a long string of letters "abcdefg12345679".

Make sure to click save after you update the config.gs.

<img width="769" alt="Screen Shot 2021-05-15 at 4 39 20 PM" src="https://user-images.githubusercontent.com/1888003/118377596-30039980-b59c-11eb-9491-37902e3fbd8c.png">



If you leave the OAuth dashboard page that has the ID you can always go back and click your app to find it.

It will be under "OAuth 2.0 Client IDs" section in the same Credentials section from step 2.  

You can click into the application to get your client secret. 
<img width="1004" alt="Screen Shot 2021-05-15 at 1 57 38 PM" src="https://user-images.githubusercontent.com/1888003/118377386-ebc3c980-b59a-11eb-929a-3122f6326249.png">


For more information about Google Cloud API:

Creating and Managing Projects: 
https://cloud.google.com/resource-manager/docs/creating-managing-projects





