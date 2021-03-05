// Essentially this:
//  Figures out whether you own the item based on information Primo provides at load (and on page updates)
//  Figures out whether partner schools own the item based on information Primo provides at load (and on page updates)
//  Checks to see if there are services you want hidden
//  Checks to see if you're already hiding them
//  Based on who owns the item -- and the criteria for hiding services -- either adds or removes CSS statements to hide/show the service

angular.module('hideService', [])
    .controller('hideServiceController', ['hideServiceConfig', function (hideServiceConfig) {
        const self = this;
        const itemDetails = self.parentCtrl.item;

    // Are there partner schools with the item
    const partners = itemDetails.delivery.almaInstitutionsList && itemDetails.delivery.almaInstitutionsList.length >= 1;

    // Do you own the item
    const localHolding = itemDetails.delivery.holding;

    // What style rules already exist
    const styleEls = document.querySelectorAll('style');

    // Arguably this structure overcomplicates things in the interest of being extensible.
    // If we're only ever going to want to hide the AFN service then there's no need to accomodate an array of potential services each with their own logic for hide/show
    // which would cut the code in half.

    for (let j = 0; j < hideServiceConfig.servicesToHide.length; j++) {
        const service = hideServiceConfig.servicesToHide[j];
        for (let i = 0; i < styleEls.length; i++) {
            const el = styleEls[i];

            // This uses dynamic stylesheets instead of directly hiding the element since it will never exist during the initial load
            // An alternative strategy would be to keep polling the page for some period of time to see if it shows up

            // If the stylesheet exists, check the config to see if the service should be displayed
            if (el.innerText === 'md-list-item[ng-repeat="service in $ctrl.filteredServices() track by $index"]:nth-child(' + service.index + ') { display: none; }') {
                const show = Function(`
                    "use strict";
                    const partners=` + partners + `;
                    const localHolding=` + localHolding + `;
                    return (` + service.showCondition + `);`)()
                if (show) {
                    el.parentNode.removeChild(el);
                }

            // If you've looked at all the stylesheets and it doesn't exist check to see if the service should be hidden
            } else if (i === styleEls.length - 1) {
                const hide = Function(`
                    "use strict";
                    const partners=` + partners + `;
                    const localHolding=` + localHolding + `;
                    return (` + service.hideCondition + `);`)()
                if (hide) {
                    const css = document.createElement('style');
                    const styles = 'md-list-item[ng-repeat="service in $ctrl.filteredServices() track by $index"]:nth-child(' + service.index + ') { display: none; }';
                    css.type = 'text/css';
                    if (css.styleSheet) {
                        css.styleSheet.cssText = styles;
                    } else {
                        css.appendChild(document.createTextNode(styles));
                        document.getElementsByTagName("head")[0].appendChild(css);
                    }
                }
            }
        }
    }
}]).component('almaHowovpAfter', {
        bindings: {
            parentCtrl: '<'
        },
        controller: 'hideServiceController',
        template: ''
    });

app.constant('hideServiceConfig', {
    servicesToHide: [{
        index: 1,
        hideCondition: '!partners && !localHolding',
        showCondition: 'partners && !localHolding'
    }]
});