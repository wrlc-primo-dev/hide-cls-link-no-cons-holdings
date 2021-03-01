// be sure to add 'hideService' to app declaration at start of customization file

angular.module('hideService', [])

    .controller('hideServiceController', ['hideServiceConfig', function (hideServiceConfig) {

      const self = this;

      const itemDetails = self.parentCtrl.item;

      const partners = itemDetails.delivery.almaInstitutionsList && itemDetails.delivery.almaInstitutionsList.length >= 1;

      const localHolding = itemDetails.delivery.holding;

      for (let j = 0; j < hideServiceConfig.servicesToHide.length; j++) {

        const service = hideServiceConfig.servicesToHide[j];

        const hide = Function(`

              "use strict";

              const partners=` + partners + `;

              const localHolding=` + localHolding + `;

              return (` + service.hideCondition + `);`)()

    // Will hide first service in list of conditions set in Config are met

            if (hide) {

              const arsSpan = document.querySelector('span[translate="' + service.name + '"]');

              const listItem = arsSpan.closest('md-list-item');

              listItem.style.display = none;

            }

      }

    }])

    .component('almaHowovpAfter', {

      bindings: {

        parentCtrl: '<'

      },

      controller: 'hideServiceController',

      template: ''

    });

 

// Set conditions for when to hide and show the service based on whether other WRLC schools or the local institution has it

  app.constant('hideServiceConfig', {

    servicesToHide: [{

      name: 'AlmaResourceSharing',

      hideCondition: '!partners && !localHolding',

      showCondition: 'partners && !localHolding'

    }]

  });
