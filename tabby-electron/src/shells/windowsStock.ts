import * as path from 'path'
import { Injectable } from '@angular/core'
import { HostAppService, Platform, ConfigService } from 'tabby-core'
import { ElectronService } from '../services/electron.service'

import { Shell } from 'tabby-local'
import { WindowsBaseShellProvider } from './windowsBase'

/** @hidden */
@Injectable()
export class WindowsStockShellsProvider extends WindowsBaseShellProvider {
    constructor (
        hostApp: HostAppService,
        config: ConfigService,
        private electron: ElectronService,
    ) {
        super(hostApp, config)
    }

    async provide (): Promise<Shell[]> {
        if (this.hostApp.platform !== Platform.Windows) {
            return []
        }

        // clink names its 32-bit build x86
        const clinkExe = `clink_${process.arch === 'ia32' ? 'x86' : process.arch}.exe`
        let clinkPath = path.join(
            path.dirname(this.electron.app.getPath('exe')),
            'resources',
            'extras',
            'clink',
            clinkExe,
        )

        if (process.env.TABBY_DEV) {
            clinkPath = path.join(
                path.dirname(this.electron.app.getPath('exe')),
                '..', '..', '..',
                'extras',
                'clink',
                clinkExe,
            )
        }
        const shells: Shell[] = [
            {
                id: 'clink',
                name: 'CMD (clink)',
                command: 'cmd.exe',
                args: ['/k', clinkPath, 'inject'],
                env: {
                    // Tell clink not to emulate ANSI handling
                    WT_SESSION: '0',
                },
                icon: require('../icons/clink.svg'),
                shellType: 'cmd',
            },
            {
                id: 'cmd',
                name: 'CMD (stock)',
                command: 'cmd.exe',
                env: {},
                icon: require('../icons/cmd.svg'),
                shellType: 'cmd',
            },
        ]

        const powershellPath = await this.findExecutable([
            `${process.env.SystemRoot}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`,
            `${process.env.SystemRoot}\\System32\\powershell.exe`,
        ], 'powershell.exe')
        if (powershellPath) {
            shells.push({
                id: 'powershell',
                name: 'PowerShell',
                command: powershellPath,
                args: ['-nologo'],
                icon: require('../icons/powershell.svg'),
                env: this.getEnvironment(),
                shellType: 'powershell',
            })
        }

        return shells
    }
}
