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

require_once "openmediavault/module.inc";
require_once "openmediavault/config.inc";
require_once "openmediavault/error.inc";
require_once "openmediavault/util.inc";
require_once "openmediavault/initscript.inc";

class OMVModuleTeamspeak3 extends OMVModuleServiceAbstract
    implements OMVINotifyListener, OMVIModuleServiceStatus {

    private function getXPath()
    {
        return "//services/teamspeak3";
    }

    public function getName() {
        return "teamspeak3";
    }

    public function getStatus() {
        global $xmlConfig;

        $object = $xmlConfig->get($this->getXPath());

        if (is_null($object))
            throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
                $this->getXPath());

        $initd = new OMVSysVInitScript($this->getName());

        return array(
            "name"    => $this->getName(),
            "title"   => gettext("Teamspeak3"),
            "enabled" => boolval($object["enable"]),
            "running" => $initd->status() == 0
        );
    }

    public function startService() {
        global $xmlConfig;

        $object = $xmlConfig->get($this->getXPath());

        if (is_null($object))
            throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
                $this->getXPath());

        if (!boolval($object["enable"]))
            return;

        $cmd = "sudo -u ts3 /etc/init.d/teamspeak3 start && update-rc.d teamspeak3 enable > /dev/null";
        if (0 !== $this->exec($cmd, $output))
            throw new OMVException(OMVErrorMsg::E_EXEC_FAILED,
                $cmd, implode("\n", $output));
    }

    public function applyConfig() {
        $cmd = "sudo omv-mkconf " . $this->getName();

        if (0 !== $this->exec($cmd, $output))
            throw new OMVException(OMVErrorMsg::E_EXEC_FAILED,
                $cmd, implode("\n", $output));
    }

    public function stopService() {
        $initd = new OMVSysVInitScript($this->getName(), FALSE);
        $initd->exec();
    }

    public function bindListeners(OMVNotifyDispatcher $dispatcher) {
        $dispatcher->addListener(
            OMV_NOTIFY_MODIFY,
            "org.openmediavault.services.teamspeak3",
            array($this, "setDirty"));
    }
}

// Register module
$moduleMgr = &OMVModuleMgr::getInstance();
$moduleMgr->registerModule(new OMVModuleTeamspeak3());
