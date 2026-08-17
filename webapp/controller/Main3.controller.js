sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment"
], function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    Fragment
) {
    "use strict";

    return Controller.extend("cf.app.controller.Main3", {

        onInit: function () {

            var oChartModel =
                this.getOwnerComponent().getModel("chart");

            if (!oChartModel) {

                console.error(
                    "Chart model 'chart' was NOT found."
                );

                return;
            }

            this.getView().setModel(
                oChartModel,
                "chart"
            );

            console.log(
                "Main3 Chart Model:",
                oChartModel.getData()
            );
        },


        onStageFilterChange: function (oEvent) {

            var sSelectedKey =
                oEvent.getSource().getSelectedKey();

            var oTable =
                this.byId("_IDGenTable22");

            var oBinding =
                oTable.getBinding("rows");

            if (!oBinding) {

                console.error(
                    "Table rows binding not found."
                );

                return;
            }

            // All stages
            if (sSelectedKey === "ALL") {

                oBinding.filter([]);

                return;
            }

            var oFilter = new Filter({

                path: "stage",

                test: function (aStages) {

                    if (!Array.isArray(aStages)) {
                        return false;
                    }

                    return aStages.some(function (oStage) {

                        return (
                            oStage.complete === sSelectedKey ||
                            oStage.status === sSelectedKey
                        );

                    });

                }

            });

            oBinding.filter([oFilter]);
        },


        formatStageStatus: function (sStatus) {

            switch (sStatus) {

                case "passed":
                    return "Success";

                case "failed":
                    return "Error";

                case "pending":
                    return "Warning";

                default:
                    return "None";
            }
        },


        formatCompleteStatus: function (sComplete) {

            switch (sComplete) {

                case "Complete":
                    return "Success";

                case "Not Complete":
                    return "Error";

                case "pending":
                    return "Warning";

                default:
                    return "None";
            }
        },
         onItemPress: async function (oEvent) {

            var oItem = oEvent.getParameter("listItem");

            if (!oItem) {
                console.error("❌ No list item selected");
                return;
            }

            console.log("✅ Item pressed:", oItem.getTitle());

            // Get CustomData
            var aCustomData = oItem.getCustomData();

            console.log("CustomData:", aCustomData);

            var sRoute = null;

            aCustomData.forEach(function (oData) {
                if (oData.getKey() === "route") {
                    sRoute = oData.getValue();
                }
            });

            console.log("🚀 Route:", sRoute);

            if (!sRoute) {
                console.error(" No route found for:", oItem.getTitle());
                return;
            }

            var sTitle = oItem.getTitle();

            // Show loading dialog if available
            if (this._showLoading) {
                await this._showLoading(
                    "Please wait, " + sTitle + " is loading..."
                );
            }

            console.log("➡️ Navigating to:", sRoute);

            this.getOwnerComponent()
                .getRouter()
                .navTo(sRoute);
        },
        _showLoading: async function (sMessage) {

            if (!this._oLoadingDialog) {

                this._oLoadingDialog = await this.loadFragment({
                    name: "cf.app.fragment.Loading"
                });

                this.getView().addDependent(this._oLoadingDialog);
            }

            Fragment.byId(
                this.getView().getId(),
                "loadingText"
            ).setText(sMessage);

            this._oLoadingDialog.open();

            return new Promise(function (resolve) {

                setTimeout(function () {

                    this._oLoadingDialog.close();

                    resolve();

                }.bind(this), 700);

            }.bind(this));
        }

    });

});