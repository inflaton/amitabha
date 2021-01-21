var Parse = window.Parse;

function setupCheckbox(element, pathname, forLineage) {
	if (element) {
		element.addEventListener('change', function () {
			const userStudyRecord = forLineage ? { lineage: this.checked } : { textbook: this.checked };

			Parse.Cloud.run("home:updateUserStudyRecord", { pathname, userStudyRecord })
				.then(result => {
					console.log(
						`updateUserStudyRecord - result: ${JSON.stringify(result)}`
					);
				})
				.catch(e => {
					console.log(`error in updateUserStudyRecord: ${e}`);
				});
		});
	}
}
function loadNavigationMenu(el) {
	const url = el.getAttribute('data-include');
	var localTest = /^(?:file):/,
		xmlhttp = new XMLHttpRequest(),
		status = 0;

	xmlhttp.onreadystatechange = function () {
		/* if we are on a local protocol, and we have response text, we'll assume
*  				things were successful */
		if (xmlhttp.readyState == 4) {
			status = xmlhttp.status;
		}
		if (localTest.test(location.href) && xmlhttp.responseText) {
			status = 200;
		}
		if (xmlhttp.readyState == 4 && status == 200) {
			var html = xmlhttp.responseText;
			const pathname = window.location.pathname.replace("/amitabha", "");
			var array = pathname.split("/");
			const count = array.length - 2;
			for (var j = 0; j < count; j++) {
				if (j == 0) {
					html = html.replaceAll('href=".', 'href="..')
				} else {
					html = html.replaceAll('href=".', 'href="../.')
				}
			}
			// console.log(`html: ${html}`);c
			el.outerHTML = html;
		}

		const loggedInUser = Parse.User.current();
		// console.log(
		// 	`loggedInUser: ${JSON.stringify(loggedInUser)}`
		// );

		var element = document.getElementById(loggedInUser ? 'member-func' : 'non-member-func');

		if (element) {
			element.setAttribute('style', 'display: block;');
		}
		element = document.getElementById('logoutButton2');

		if (element) {
			element.addEventListener('click', () => {
				console.log(
					`logoutButton2 clicked - loggedInUser: ${JSON.stringify(Parse.User.current())}`
				);
				Parse.User.logOut().catch(() => { }).then(() => {
					window.location.href = '/index.html';
					return false;
				});
			}, false);
		}
	}

	try {
		xmlhttp.open("GET", url, true);
		xmlhttp.send();
	} catch (err) {
		/* todo catch error */
	}
}

document.addEventListener('DOMContentLoaded', () => {
	var element = document.getElementById('navigationMenu');
	if (element) {
		loadNavigationMenu(element);
	}

	const loggedInUser = Parse.User.current();
	// console.log(
	// 	`loggedInUser: ${JSON.stringify(loggedInUser)}`
	// );

	element = document.getElementById(loggedInUser ? 'member' : 'non-member');

	if (element) {
		element.setAttribute('style', 'display: block;');
	}

	element = document.getElementById('logoutButton');

	if (element) {
		element.addEventListener('click', () => {
			console.log(
				`logoutButton clicked - loggedInUser: ${JSON.stringify(Parse.User.current())}`
			);
			Parse.User.logOut().catch(() => { }).then(() => {
				window.location.href = '/index.html';
				return false;
			});
		}, false);
	}

	if (loggedInUser) {
		element = document.getElementById('lineageCheckbox');

		if (element) {
			const pathname = window.location.pathname;
			Parse.Cloud.run("home:getUserStudyRecord", { pathname })
				.then(result => {
					console.log(
						`getUserStudyRecord - result: ${JSON.stringify(result)}`
					);
					element.setAttribute('type', 'checkbox');
					element.checked = result.lineage;
					setupCheckbox(element, pathname, true);

					element = document.getElementById('textbookCheckbox');

					if (element) {
						element.setAttribute('type', 'checkbox');
						element.checked = result.textbook;
						setupCheckbox(element, pathname, false);
					}
				})
				.catch(e => {
					console.log(`error in getUserStudyRecord: ${e}`);
				});
		}
	}
}, false);
