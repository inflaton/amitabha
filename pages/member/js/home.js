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

document.addEventListener('DOMContentLoaded', () => {
	const loggedInUser = Parse.User.current();
	// console.log(
	// 	`loggedInUser: ${JSON.stringify(loggedInUser)}`
	// );

	var element = document.getElementById(loggedInUser ? 'member' : 'non-member');

	if (element) {
		element.setAttribute('style', 'display: block;');
	}

	element = document.getElementById(loggedInUser ? 'member-func' : 'non-member-func');

	if (element) {
		element.setAttribute('style', 'display: block;');
	}

	element = document.getElementById('logoutButton');

	if (element) {
		element.addEventListener('click', () => {
			Parse.User.logOut().catch(() => { }).then(() => {
				window.location.href = '/index.html';
				return false;
			});
		}, false);
	}

	element = document.getElementById('logoutButton2');

	if (element) {
		element.addEventListener('click', () => {
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
