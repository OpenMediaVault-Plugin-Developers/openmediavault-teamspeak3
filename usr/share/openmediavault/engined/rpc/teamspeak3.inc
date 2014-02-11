<?php

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

require_once "openmediavault/object.inc";
require_once "openmediavault/config.inc";
require_once "openmediavault/error.inc";
require_once "openmediavault/util.inc";
require_once "openmediavault/rpcservice.inc";
require_once "openmediavault/notify.inc";

class OMVRpcServiceTeamspeak3 extends OMVRpcServiceAbstract {

    private function getXPath()
    {
        return "//services/teamspeak3";
    }

    public function getName() {
        return "Teamspeak3";
    }

    public function initialize() {
        $this->registerMethod("getSettings");
        $this->registerMethod("setSettings");
        $this->registerMethod('doUpdateTS3');
        $this->registerMethod('doUpdateEULA');
    }

    function getSettings($params, $context) {
        global $xmlConfig;

        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR ));

        $object = $xmlConfig->get($this->getXPath());

        if(is_null($object))
            throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED, "//services/teamspeak3");

        $object["enable"]	= boolval($object["enable"]);
        $object["showtab"]	= boolval($object["showtab"]);
        $object["update"]	= boolval($object["update"]);

        return $object;
    }

    function setSettings($params, $context) {
        global $xmlConfig;

        $this->validateMethodContext($context, array("role" => OMV_ROLE_ADMINISTRATOR));

        $this->validateMethodParams($params, '{
            "type"       : "object",
            "properties" : {
                "enable"  	: { "type" : "boolean" },
                "showtab" 	: { "type" : "boolean" },
                "update"  	: { "type" : "boolean" },
                "password"	: { "type" : "string" },
                "queryport"  	: { "type" : "integer","minimum":1,"maximum":65535 },
                "vsport"        : { "type" : "integer","minimum":1,"maximum":65535 },
                "fileport"	: { "type" : "integer","minimum":1,"maximum":65535 },
                "restartmsg"	: { "type" : "string" },
                "eula"		: { "type" : "boolean" }
            }
        }');

        $object = array(
            "enable"		=> array_boolval($params, "enable"),
            "showtab"		=> array_boolval($params, "showtab"),
            "update"		=> array_boolval($params, 'update'),
            "password"		=> $params['password'],
            "queryport"		=> $params['queryport'],
            "vsport"		=> $params['vsport'],
            "fileport"		=> $params['fileport'],
            "restartmsg"	=> $params['restartmsg'],
            "eula"		=> array_boolval($params, "eula")
        );

        if(false === $xmlConfig->replace($this->getXPath(), $object))
            throw new OMVException(OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED, $this->getXPath());

        $dispatcher = &OMVNotifyDispatcher::getInstance();
        $dispatcher->notify(OMV_NOTIFY_MODIFY, "org.openmediavault.services.teamspeak3", $object);
        return $object;
    }

    public function doUpdateTS3($params, $context) {
        $cmd = "omv-mkconf teamspeak3 update 2>&1";
        if(0 !== $this->exec($cmd, $output))
           throw new OMVException(OMVErrorMsg::E_EXEC_FAILED, $cmd, implode("\n", $output));
        $dispatcher = &OMVNotifyDispatcher::getInstance();
        $dispatcher->notify(OMV_NOTIFY_MODIFY, "org.openmediavault.services.teamspeak3", $object);
    }

    public function doUpdateEULA($params, $context) {
        $cmd = "omv-mkconf teamspeak3 eula 2>&1";
        if(0 !== $this->exec($cmd, $output))
           throw new OMVException(OMVErrorMsg::E_EXEC_FAILED, $cmd, implode("\n", $output));
        $dispatcher = &OMVNotifyDispatcher::getInstance();
        $dispatcher->notify(OMV_NOTIFY_MODIFY, "org.openmediavault.services.teamspeak3", $object);
    }
}

// Register the RPC service.
$rpcServiceMgr = &OMVRpcServiceMgr::getInstance();
$rpcServiceMgr->registerService(new OMVRpcServiceTeamspeak3());