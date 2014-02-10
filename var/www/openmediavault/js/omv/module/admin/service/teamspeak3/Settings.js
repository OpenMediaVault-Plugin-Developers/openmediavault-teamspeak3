/**
 * Copyright (C) 2013-2014 OpenMediaVault Plugin Developers
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// require("js/omv/WorkspaceManager.js")
// require("js/omv/workspace/form/Panel.js")
// require("js/omv/data/Store.js")
// require("js/omv/data/Model.js")
// require("js/omv/form/plugin/LinkedFields.js")

Ext.define("OMV.module.admin.service.teamspeak3.Settings", {
    extend   : "OMV.workspace.form.Panel",
    requires : [
        "OMV.data.Model",
        "OMV.data.Store",
        "OMV.module.admin.service.teamspeak3.UpdateTS3"
    ],

    rpcService   : "Teamspeak3",
    rpcGetMethod : "getSettings",
    rpcSetMethod : "setSettings",

    plugins      : [{
        ptype        : "linkedfields",
        correlations : [{
            name       : [
                "updatets3",
            ],
            conditions : [
                { name  : "update", value : false }
            ],
            properties : "!show"
        },{
            name       : [
                "update",
            ],
            properties : "!show"
        }]
    }],

    initComponent : function () {
        var me = this;

        me.on("load", function () {
            var checked = me.findField("enable").checked;
            var showtab = me.findField("showtab").checked;
            var parent = me.up("tabpanel");

            if (!parent)
                return;

            var managementPanel = parent.down("panel[title=" + _("Web Interface") + "]");

            if (managementPanel) {
                checked ? managementPanel.enable() : managementPanel.disable();
                showtab ? managementPanel.tab.show() : managementPanel.tab.hide();
            }
        });

        me.callParent(arguments);
    },


    getFormItems : function() {
        var me = this;

        return [{
            xtype    : "fieldset",
            title    : "General settings",
            defaults : {
                labelSeparator : ""
            },
            items : [{
                xtype      : "checkbox",
                name       : "enable",
                fieldLabel : _("Enable"),
                boxLabel   : _("By clicking Enable you are agreeing to Teamspeaks EULA "),
                checked    : false,
				plugins: [{
                    ptype: "fieldinfo",
                    text: _("By clicking Enable you are agreeing to Teamspeaks <a href='http://www.teamspeak.com/?page=eula' target='_blank'>EULA</a>."),
				}]
            },{
                xtype      : "checkbox",
                name       : "showtab",
                fieldLabel : _("Show Tab"),
                boxLabel   : _("Show tab containing Teamspeak3 web interface frame."),
                checked    : false
            },{
                xtype   : "checkbox",
                name    : "update"
            },{
                xtype   : "button",
                name    : "updatets3",
                text    : _("Update Teamspeak"),
                scope   : this,
                handler : function() {
                    var me = this;
                    OMV.MessageBox.show({
                        title   : _("Confirmation"),
                        msg     : _("Are you sure you want to update Teamspeak?"),
                        buttons : Ext.Msg.YESNO,
                        fn      : function(answer) {
                            if (answer !== "yes")
                               return;

                            OMV.Rpc.request({
                                scope   : me,
                                rpcData : {
                                    service : "Teamspeak3",
                                    method  : "doUpdateTS3",
                                    params  : {
                                        update   : 0
                                    }
                                },
                                success : function(id, success, response) {
                                    me.doReload();
                                    OMV.MessageBox.hide();
                                }
                            });
                        },
                        scope : me,
                        icon  : Ext.Msg.QUESTION
                    });
                }
            },{
                xtype   : "button",
                name    : "openteamspeak3",
                text    : _("Teamspeak3 Web Interface"),
                scope   : this,
                handler : function() {
                    var link = "http://" + location.hostname + ":5050/";
                    window.open(link, "_blank");
                },
                margin : "0 0 5 0"
            }]
        }];
    },
});

OMV.WorkspaceManager.registerPanel({
    id        : "settings",
    path      : "/service/teamspeak3",
    text      : _("Settings"),
    position  : 10,
    className : "OMV.module.admin.service.teamspeak3.Settings"
});
