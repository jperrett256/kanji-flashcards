const parse = require('csv-parse');
const stringify = require('csv-stringify');
const fs = require('fs');
const puppeteer = require('puppeteer');
const assert = require('assert');
const { pipeline } = require('stream');

main();

// pulls data off the japandict page (out of #section2)
function getPageData(section) {
	let $headings = $(section).find('h2');
	let result = {};

	// store data in results object
	$headings.each(function() {
		let $heading = $(this);
		let heading_str = $heading.text();
		let heading_result;

		// set heading_result based on heading
		switch(heading_str) {
			case 'Reading':
				console.log('Reading'); // DEBUG
				heading_result = {};

				let $list_group = $heading.nextUntil('ul.list-group').last().next();
				$list_group.find('dl').each(function() {
					let dt = $(this).find('dt').text();
					let dd = $(this).find('dd > span').map(function() {
						return $(this).text();
					}).toArray();

					heading_result[dt] = dd;
				});

				break;
			case 'Meaning':
				console.log('Meaning'); // DEBUG

				heading_result = $heading.parent().next().find('.tab-content .active li').text();

				break;
			case 'Stroke order':
				// TODO

				break;
			case 'Popular compounds containing this kanji':
				console.log('Compounds'); // DEBUG
				heading_result = [];

				$heading.parent().next().find('.list-group-item').each(function() {
					heading_result.push({
						compound: $(this).find('h4').text(),
						reading: $(this).find('span').text(),
						meaning: $(this).find('p').text()
					});
				});

				heading_str = 'Compounds'; // set result dictionary key

				break;
			case 'Miscellaneous information':
				console.log('Miscellaneous'); // DEBUG

				heading_result = $heading.parent().next().find('.list-group-item').map(function() {
					return $(this).text();
				}).toArray();

				heading_str = 'Miscellaneous';

				break;
			default:
				// skip
				break;
		}

		// store heading_result in results object
		if (heading_result)	result[heading_str] = heading_result;
	});

	return result;
}

async function getOnlineInfo(page, kanji_char) {
	try {
		// TODO use the same browser each time?
		await page.goto('https://www.japandict.com/kanji/' + kanji_char);

		console.log('Loaded page for: ' + kanji_char); // DEBUG

		let page_data = await page.$eval('#section2', getPageData);

		console.log(page_data); // DEBUG

		return page_data;

	} catch(e) {
		console.error(e);
	}
}

async function main() {
	try {
		assert(process.argv[2]);
		assert(process.argv[3]);
		const inputcsv = process.argv[2];
		const outputcsv = process.argv[3];

		const browser = await puppeteer.launch({
			// 'headless': false // DEBUG
		});
		const page = (await browser.pages())[0];

		await new Promise((resolve, reject) => {
			pipeline(
				fs.createReadStream(inputcsv).pipe(parse()),
				async function* (source) {
					for await (const record of source) {
						let kanji_char = record[0];
						let info = await getOnlineInfo(page, kanji_char);
						yield record.concat([JSON.stringify(info)]);
					}
				},
				stringify(),
				async function* (source) {
					source.setEncoding('utf8');
					for await (const row of source) {
						yield row;
					}
				},
				fs.createWriteStream(outputcsv),
				err => {
					if (err) reject(err);
					resolve();
				}
			);
		});

		await browser.close();

		console.log('Success');

	} catch (e) {
		console.error(e);
	}
}
