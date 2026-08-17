sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/ui/core/UIComponent",
    "sap/viz/ui5/controls/common/feeds/FeedItem",
    "sap/ui/core/Fragment"
], (Controller, JSONModel, FlattenedDataset,UIComponent, FeedItem,Fragment) => {
    "use strict";

    return Controller.extend("cf.app.controller.Main5", {
        onInit: function () {

       var oData = {
    items: [
        {
            Initials: "SS",
            Full_Name:"Siphiwe Shipalane",
            Name: "Siphiwe",
            Role: "Individual",
            User_Type: "Admin",
            Submitted: "2026-02-02",
            Last_Login: "2026-03-03",
            Email: "siphiwe.shipalane@atisasoftware.co.za",
            Date: "07 Jul 2026"
        },
    ]
};
var oModel = new JSONModel(oData);
this.getView().setModel(oModel, "users");
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
    })
});