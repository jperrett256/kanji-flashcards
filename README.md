# Background Information

A comparitive table of jōyō kanji, tradional Chinese characters and simplified Chinese characters may be found at [this drive link](https://drive.google.com/file/d/0B_v5DhUsRRWgeXFINWRRM1BUTjA/view), linked to from this [blog post](http://taretz.blogspot.com/2008/07/3000-most-frequently-used-chinese.html).
It contains 1945 kanji and information regarding the corresponding Chinese characters.

This table has not been updated to match the late 2010 revision of the jōyō kanji, in which 196 characters were added and 5 characters were removed, for a total of 2136 characters.

# Process Overview

Data has been exported from the PDF and transformed into a more useful format.

# Scripts

- comparative_list_text_to_csv.py

This converts the extracted joyo kanji table into a csv table with a format that is more suitable for flashcards. Each row has the actual characters in it, if it exists (rather than a quotation mark to indicate it is the same as the kanji). There is an extra entry_type field, which indicates how the three characters relate to one another (i.e. which are same and which are different).
