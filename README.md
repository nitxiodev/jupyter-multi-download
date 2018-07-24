# jupyter-multi-download
Just a simple button to download multiple files at once from jupyter.

# How to install
- Download Tampermonkey for Google Chrome/Chromium or Mozilla Firefox.
- Download or clone this repository.
- Add download.js to Tampermonkey:
  * Go to Tampermonkey button on right-top corner (usually) > Dashboard.
  * Press on '+' button and copy download.js content into it.
  * Save it.
  
# Configuration
Current version will **only** work on localhost:8888 address. Therefore, if we have jupyter deployed in another url, it is necessary to change it by setting the corresponding @match tag in the header. For instance:
- @match http://my-private-address.com:8888/* -> tampermonkey run the script only in this address.

After that, go to the url where your jupyter is deployed, and reload the page.

# Options
With the focus on jupyter window:
- Keep **Ctrl** pressed and hover the mouse through each file to make a multiple selection (v0.2b). 

# Last notes
This script has been tested using tampermonkey on Chromium 66 and Firefox Quantum 61 with Jupyter-notebook 5.6.0
