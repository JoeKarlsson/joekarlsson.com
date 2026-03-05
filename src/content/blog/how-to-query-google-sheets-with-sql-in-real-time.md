---
title: 'How to query Google Sheets with SQL in real time'
date: 2024-03-29
slug: 'how-to-query-google-sheets-with-sql-in-real-time'
description: 'Sick of manually wrestling with Google Sheets like it’s an Excel spreadsheet from 2005? Feel like force-quitting Chrome every time you attempt to sift through just 10,000 rows of data?  We’ve all...'
categories: ['Databases']
heroImage: '/images/blog/how-to-query-google-sheets-with-sql-in-real-time/How-to-analyze-Google-Sheets-data-in-real-time-BlogPost-He-1-scaled.webp'
---

Sick of manually wrestling with Google Sheets like it’s an Excel spreadsheet from 2005? Feel like force-quitting Chrome every time you attempt to sift through just 10,000 rows of data? 

![Mac Force Quit dialog meme about Google Sheets loading too many rows](/images/blog/how-to-query-google-sheets-with-sql-in-real-time/D-WZo_Nh7oEuIoOwgCG_itm9UH7-5nJkQtmd2J1K8JkuDTXGCbPq58XQlutZ.webp)

We’ve all been there.

Let’s level up. [<u>Tinybird</u>](https://www.tinybird.co/) makes it simple to query even the largest Google Sheets tables in real-time using SQL so you can build real-time analytics metrics and publish them as secure, interoperable APIs.

If you want to get your hands dirty and follow along with this tutorial, [the GitHub repository awaits](https://github.com/tinybirdco/google-sheets-tinybird-demo).

Looking for an analytics database?

Listen, we aren’t here to judge your [choice of database](https://www.tinybird.co/blog-posts/best-database-for-real-time-analytics). If Google Sheets or Excel work for you, then you do you. However, if you’re starting to feel the pain of slow analytics in Sheets or Excel, consider trying Tinybird, a serverless online real-time data platform. You can upload a CSV file with billions of rows and query it in milliseconds. [Give it a try for free here](https://www.tinybird.co/signup?referrer=https%3A%2F%2Fwww.tinybird.co%2Fblog-posts%2Fquery-google-sheets-in-real-time).

## **How to query your Google Sheets data in real-time**

Follow these steps to query a Google Sheet with SQL.

## Step 1: Sign Up for Tinybird

Tinybird is a real-time data platform that makes it easy to query any amount of data using SQL and publish your metrics as real-time APIs. You can use Tinybird as a backend for customized [<u>real-time dashboards</u>](https://www.tinybird.co/blog-posts/real-time-dashboard-step-by-step) or to integrate data-driven features into your website or product. You can find more information about Tinybird [<u>in its documentation</u>](https://www.tinybird.co/docs).

Tinybird has a time-unlimited free tier, so you can start building today and learn at your own pace. Sign up for a free account[<u> here</u>](https://www.tinybird.co/signup).

After you sign up and confirm your email, you can create a [<u>Workspace</u>](https://www.tinybird.co/docs/concepts/workspaces.html). Give your Workspace a name; you can call it whatever you want, but you’ll usually want to name it after what you are building, like `google_sheets` , or whatever you titled your spreadsheet.

## Step 2: Obtain Your Tinybird Auth Token

All Tinybird resources are protected by [<u>Auth Tokens</u>](https://www.tinybird.co/docs/concepts/auth-tokens.html). Navigate to [<u>your Tinybird dashboard</u>](https://ui.tinybird.co) in your Workspace, click “Auth Tokens” from the left navigation bar, and copy the “create datasource” token.

![Tinybird Auth Tokens page showing the create datasource token to copy](/images/blog/how-to-query-google-sheets-with-sql-in-real-time/token-1024x612.webp)

Copy the “create datasource” token from your Tinybird Workspace.

## Step 3. Open Your Google Sheet

Open the Google Sheet containing the data you want to query with Tinybird. In this demo, we are using a sample data set of customer shopping trends ([<u>which you can download from our GitHub</u>](https://github.com/tinybirdco/google-sheets-tinybird-demo/blob/main/customer_shopping_trends_dataset.csv)).

If you need to import this data set into Google Sheets, first download it to your machine, then in Google Sheets select “File > Import > Upload > Select a file from your device > Import data > Replace current sheet.”

## Step 4. Write an Apps Script to sync data to Tinybird

Next, you need to add a script to your Google Sheet to tell it to send data to Tinybird. To do so, navigate to “Extensions > Apps Script” on the Google Sheet menu bar.

![Google Sheets Extensions menu showing Apps Script option with shopping data](/images/blog/how-to-query-google-sheets-with-sql-in-real-time/create_apps_script-1024x614.webp)

Create an Apps Script in Google Sheets to send data to Tinybird.

In the script editor, write or paste the code from the [<u>`Code.gs`</u>](https://github.com/tinybirdco/google-sheets-tinybird-demo/blob/main/Code.gs) file in the [<u>GitHup repo</u>](https://github.com/tinybirdco/google-sheets-tinybird-demo). To customize this code to your Tinybird Workspace, replace `YOUR_TOKEN_HERE` on line 6 with your actual Tinybird user token. In addition, you may need to update the API URL on line 64 with the correct API URL depending on your cluster. For example, a Workspace in a `us-east` cluster should use the URL `https://api.us-east.tinybird.co/v0/events?name=`.

Here’s what the `Code.gs` file looks like for me (though I’m obviously not sharing my user token 😉).

```javascript
function sendDataToTinybird() {
  // Get the active sheet in your Google Spreadsheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Use your Tinybird authorization token
  var tinybirdToken = “YOUR_TINYBIRD_TOKEN”;

  // Rename the sheet, turning spaces into underscores and making it all lowercase
  var sheetName = SpreadsheetApp.getActiveSpreadsheet()
    .getName()
    .toLowerCase()
    .replace(/ /g, “_”);

  // Get column names. Remove empty ones.
  var lastColumn = sheet.getLastColumn();
  var columnNames = sheet
    .getRange(1, 1, 1, lastColumn)
    .getValues()[0]
    .filter(function (name) {
      return name;
    });

  // Set up the header for our web request
  var headers = {
    Authorization: “Bearer “ + tinybirdToken,
  };

  // Get all the data from the sheet
  var lastRow = sheet.getLastRow();
  var range = sheet.getRange(2, 1, lastRow - 1, lastColumn);
  var rows = range.getValues();

  // We'll send data in chunks of 500 rows at a time
  var batchSize = 500;
  for (var start = 0; start < rows.length; start += batchSize) {
    // Find the last row in this batch
    var end = Math.min(start + batchSize, rows.length);

    // Get the rows for this batch
    var batchRows = rows.slice(start, end);

    // Convert the batch of rows to the needed JSON format
    var payload = batchRows
      .map(function (row) {
        var obj = {};
        for (var i = 0; i < columnNames.length; i++) {
          obj[columnNames[i]] = row[i];
        }
        return JSON.stringify(obj);
      })
      .join(“\n”);

    // Set up the web request
    var options = {
      method: “post”,
      contentType: “application/json”,
      headers: headers,
      payload: payload,
      muteHttpExceptions: true, // To get full response even if there's an error
    };

    // Send the data
    var response = UrlFetchApp.fetch(
      “https://api.us-east.tinybird.co/v0/events?name=” + sheetName,
      options
    );

    // Show the result of our request
    Logger.log(response.getContentText());
  }
}

// Creates a new menu in Google Sheets when you open the spreadsheet
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu(“Tinybird”)
    .addItem(“Send Data to Tinybird”, “sendDataToTinybird”)
    .addToUi();
}
```

## Step 5: Save and run the Script

Click the save icon or press `Ctrl + S` (`Cmd + S` for Mac).

Click “Run” in the Apps Script toolbar to execute the script. If it’s your first time running the script, you’ll need to grant it permission to access your Google Sheets data.

If there are errors, they’ll be in the “Execution log” tab. Use `Logger.log()` for custom log messages in your App Script.

![Google Apps Script editor with Tinybird data sync code and execution log](/images/blog/how-to-query-google-sheets-with-sql-in-real-time/appscript-1024x612.webp)

The console will show you how much data has been sent to Tinybird, and if any rows were sent to [quarantine](https://www.tinybird.co/docs/guides/quarantine.html).

## Step 6: Check that your data is in Tinybird

Navigate to your Tinybird Workspace. You should see a new Data Source with the name you added to the Apps Script in Step 5. If you used the default name, it will be the same name as your Google Sheet. You’ll notice that Tinybird’s [Analyze API](https://www.tinybird.co/docs/api-reference/analyze-api.html) has automatically inferred the appropriate data types for the table based on the data you sent.

![Tinybird workspace showing customer shopping trends data source table](/images/blog/how-to-query-google-sheets-with-sql-in-real-time/image.webp)

Check that data is arriving in your Tinybird Data Source.

## Step 7: Query your data with SQL

Start by creating a new Pipe in Tinybird. A [<u>Pipe</u>](https://www.tinybird.co/docs/concepts/pipes.html) is a way of writing chained SQL queries. You can break up your SQL into multiple [<u>nodes</u>](https://www.tinybird.co/docs/concepts/pipes.html#nodes), and each Node can query the results from prior nodes. You can publish any Node in your Pipe as an [<u>API Endpoint</u>](https://www.tinybird.co/docs/concepts/apis.html).

For example, here is a three node Pipe that calculates the usage rate of promo codes, titled `usage_rate_of_promo_codes`.

The first node, `promo_usage`, will determine the number of promo codes used.

```javascript
function sendDataToTinybird() {
  // Get the active sheet in your Google Spreadsheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Use your Tinybird authorization token
  var tinybirdToken = “YOUR_TINYBIRD_TOKEN”;

  // Rename the sheet, turning spaces into underscores and making it all lowercase
  var sheetName = SpreadsheetApp.getActiveSpreadsheet()
    .getName()
    .toLowerCase()
    .replace(/ /g, “_”);

  // Get column names. Remove empty ones.
  var lastColumn = sheet.getLastColumn();
  var columnNames = sheet
    .getRange(1, 1, 1, lastColumn)
    .getValues()[0]
    .filter(function (name) {
      return name;
    });

  // Set up the header for our web request
  var headers = {
    Authorization: “Bearer “ + tinybirdToken,
  };

  // Get all the data from the sheet
  var lastRow = sheet.getLastRow();
  var range = sheet.getRange(2, 1, lastRow - 1, lastColumn);
  var rows = range.getValues();

  // We'll send data in chunks of 500 rows at a time
  var batchSize = 500;
  for (var start = 0; start < rows.length; start += batchSize) {
    // Find the last row in this batch
    var end = Math.min(start + batchSize, rows.length);

    // Get the rows for this batch
    var batchRows = rows.slice(start, end);

    // Convert the batch of rows to the needed JSON format
    var payload = batchRows
      .map(function (row) {
        var obj = {};
        for (var i = 0; i < columnNames.length; i++) {
          obj[columnNames[i]] = row[i];
        }
        return JSON.stringify(obj);
      })
      .join(“\n”);

    // Set up the web request
    var options = {
      method: “post”,
      contentType: “application/json”,
      headers: headers,
      payload: payload,
      muteHttpExceptions: true, // To get full response even if there's an error
    };

    // Send the data
    var response = UrlFetchApp.fetch(
      “https://api.us-east.tinybird.co/v0/events?name=” + sheetName,
      options
    );

    // Show the result of our request
    Logger.log(response.getContentText());
  }
}

// Creates a new menu in Google Sheets when you open the spreadsheet
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu(“Tinybird”)
    .addItem(“Send Data to Tinybird”, “sendDataToTinybird”)
    .addToUi();
}
```

The second node, `total_purchases` will get the total number of purchases.

```sql
SELECT COUNT(*) as Total_Count
FROM customer_shopping_trends_dataset
```

A final node called `endpoint` brings these two queries together, retrieving the promo codes used and the number of times each code was used (`Used_Count`), and calculating the usage rate as a percentage of the total purchases.

```sql
SELECT
  Used_Count,
  Total_Count
  (Used_Count / Total_Count * 100) as Usage_Rate
FROM promo_usage, total_purchases
```

In the repository, you’ll find [<u>several more `.pipe` files</u>](https://github.com/tinybirdco/google-sheets-tinybird-demo/tree/main/pipes) that define additional SQL queries for this example dataset. You can upload these files to the Tinybird server using [<u>Tinybird’s CLI</u>](https://www.tinybird.co/docs/cli/overview).

## Step 8: Create an API Endpoint

If you want to publish these metrics as an API Endpoint for use in [<u>real-time dashboards</u>](https://www.tinybird.co/blog-posts/real-time-dashboard-step-by-step), user-facing analytics, or any other [<u>real-time data analytics</u>](https://www.tinybird.co/blog-posts/real-time-analytics-a-definitive-guide) use case, you can do that by selecting, “Create API Endpoint” and selecting the node you want to be published. In my case, that’s the node called `endpoint`.

![Tinybird SQL pipe querying customer shopping trends with API endpoint](/images/blog/how-to-query-google-sheets-with-sql-in-real-time/api_thumb-1-1024x666.webp)

Turn your SQL Pipe into REST API in a click.

From here, try pasting the sample HTTP sample into your browser, and you will be able to see the data from your SQL query, based on your data from Google Sheets, published as an API Endpoint. This Endpoint can be used to connect your Google Sheets data to other applications, [<u>real-time dashboards</u>](https://www.tinybird.co/blog-posts/real-time-dashboard-step-by-step), or to share it with others as a fully documented data product.

## Wrap up

You’ve achieved far more than a simple integration of Google Sheets with Tinybird; you’ve unlocked serious [<u>real-time data analytics</u>](https://www.tinybird.co/blog-posts/real-time-analytics-a-definitive-guide) capabilities. This combo is far from a one-trick pony. Let’s unpack the expanded universe of what you can now accomplish.

- **Enriching Data in Real-Time:** Imagine your Google Sheet is tracking sales metrics. With Tinybird, you can automatically enrich that data with real-time inventory levels or customer data from your CRM, other APIs, or even another Google Sheet. This means you can create complex queries that pull from multiple data sources to generate on-the-fly insights, making your Google Sheet a centralized, real-time data hub.

- **Advanced Dashboards:** Sure, Google Sheets has built-in capabilities for charts and simple dashboards, but with Tinybird, you can take this to another level. Use Tinybird to pull data from your Google Sheets and build customized, dynamic [<u>real-time dashboards</u>](https://www.tinybird.co/blog-posts/real-time-dashboard-step-by-step) that can handle millions of rows of data in real time.

- **Automated, Flexible Workflows:** The API integrations don’t stop at data enrichment. You can build out workflows that push data from Tinybird back into Google Sheets or into other applications, offering a two-way data highway. This could include triggering specific actions, like sending alerts or updating other databases when certain conditions in your Google Sheets data are met.

- **Multi-Source Query Execution:** Use SQL queries that can call upon multiple sources of data, not just Google Sheets. Your analytics can be as broad or as specialized as your projects require, whether it’s marketing analytics or financial models

- **Security and Scalability:** Tinybird offers strong security protocols to keep your data safe, and its architecture is built for scalability. This means as your needs grow, your Google Sheets-Tinybird integration can easily scale along with them, all without compromising speed or data integrity.

To check out the complete codebase used for this tutorial, [<u>check out the GitHub repository</u>](https://github.com/tinybirdco/google-sheets-tinybird-demo/tree/main).

To learn more about Tinybird, you can [<u>visit the website</u>](https://www.tinybird.co), check out the product [<u>documentation</u>](https://www.tinybird.co/docs), or even [<u>get started for free</u>](https://www.tinybird.co/signup?referrer=) with no credit card or time limit.

If you have questions about how Tinybird works, or how to build real-time data pipelines and APIs with Tinybird, feel free to [<u>join us on Slack</u>](https://www.tinybird.co/docs/community).

## FAQs

### How secure is the Tinybird-Google Sheets integration?

The integration uses Tinybird’s strong security protocols. Data is transferred via secure methods, using Auth Tokens, which only authorized personnel can access. Security is built into both the data transmission and storage layers.

### Is there a limit to the amount of data I can transfer from Google Sheets to Tinybird?

While Google Sheets itself has row and column limits, Tinybird is engineered for scalability. Its architecture allows for handling billions of rows, ensuring you can perform [<u>real-time analytics</u>](https://www.tinybird.co/blog-posts/real-time-analytics-a-definitive-guide) on large datasets without compromising on speed.

### Can I use other data visualization tools along with Tinybird and Google Sheets?

Yes, the API Endpoints created in Tinybird can be used to feed data into other visualization tools like Tableau, Power BI, Grafana, or custom web dashboards. Tinybird essentially allows your Google Sheets data to be accessed in a standardized, API-friendly manner.

### Is real-time data enrichment limited to specific types of data sources?

No. Tinybird can integrate with a variety of data sources, including CRMs, inventory management systems, streaming data platforms, data warehouses, and other third-party APIs. You can enrich your Google Sheets data with real-time information from multiple sources, making your analysis thorough.

### Can I execute complex SQL queries using Tinybird and Google Sheets?

Absolutely. Tinybird’s SQL engine is very powerful and designed for complex analytics queries. You can perform complex joins, aggregation functions, and filters on your data, even if it’s coming from multiple sources. This allows for in-depth, real-time analytics directly using SQL.

### What alternatives to Google Sheets should I consider for storing data?

Spreadsheets are a flexible way to interact and analyze tabular data, but they struggle when used as a database. As a simple replacement, you can consider a relational SQL database like Postgres, MySQL, or SQL Server. If analytics is your end goal, an OLAP platform like ClickHouse, Google BigQuery, or Tinybird will better serve your aims.
