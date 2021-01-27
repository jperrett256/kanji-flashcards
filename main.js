const parse = require('csv-parse');
const generate = require('csv-generate');
const fs = require('fs');
const puppeteer = require('puppeteer');
const assert = require('assert');
const { pipeline } = require('stream');

main();

async function getOnlineInfo(kanji_char) {
	try {
		// TODO use the same browser each time?
		const browser = await puppeteer.launch({
			'headless': false // DEBUG
		});
		const page = (await browser.pages())[0];
		await page.goto('https://www.japandict.com/kanji/' + kanji_char);

		console.log('Loaded page for: ' + kanji_char); // DEBUG

		// let lists = await page.$$('.list-group'); // TODO
		// console.log(lists.length);

		// let lists = await page.$$eval('.list-group', lists => {
		// 	lists.forEach(list => {
		// 		console.log($(list).html());
		// 	});
		// });
		let lists = await page.$eval('#section2', section => { // TODO
			let $headings = $(section).find('h2');

			$headings.each(function() {
				let $heading = $(this);

				switch($heading.text()) {
					case "Reading":
						console.log('Reading')
						console.log($heading.nextUntil('ul.list-group').last().next())
						break;
					case 'Meaning':
						console.log('Meaning')
						console.log($heading.parent().next().find('.tab-content .active'));
						break;
					default:
						// TODO
						break;
				}
			});
		});

		await new Promise((resolve, reject) => { // DEBUG
			setTimeout(resolve, 100000);
		});

		await browser.close();

	} catch(e) {
		console.error(e);
	}
}

async function main() {
	try {
		assert(process.argv[2]);
		const inputcsv = process.argv[2];

		await new Promise((resolve, reject) => {
			pipeline(
				fs.createReadStream(inputcsv).pipe(parse()),
				async function* (source) {
					for await (const record of source) {
						console.log(record);
						let kanji_char = record[0];
						let info = await getOnlineInfo(kanji_char);
						// TODO do sth with result
					}
				},
				process.stdout,
				err => {
					if (err) reject(err);
					resolve();
				}
			);
		});

		console.log('Success');

	} catch (e) {
		console.error(e);
	}
}
