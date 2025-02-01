'use client'

import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'kn', name: 'Kannada' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
]

declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: any;
    }
}

export default function GoogleTranslator() {
    const [selectedLang, setSelectedLang] = useState('en')

    useEffect(() => {
        let script: HTMLScriptElement | null = null;

        const addScript = () => {
            const existingScript = document.getElementById('google-translate-script')
            if (existingScript) {
                existingScript.remove()
            }

            script = document.createElement('script')
            script.id = 'google-translate-script'
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
            script.async = true
            document.body.appendChild(script)
        }

        window.googleTranslateElementInit = function () {
            const existingElement = document.getElementById('google_translate_element')
            if (existingElement) {
                while (existingElement.firstChild) {
                    existingElement.removeChild(existingElement.firstChild)
                }
            }

            new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: languages.map(lang => lang.code).join(','),
                autoDisplay: false,
            }, 'google_translate_element')
        }

        addScript()

        // Cleanup function
        return () => {
            if (script && script.parentNode) {
                script.parentNode.removeChild(script)
            }
            // Remove the google translate elements
            const elementsToRemove = [
                '.skiptranslate',
                '#google_translate_element'
            ]
            elementsToRemove.forEach(selector => {
                const elements = document.querySelectorAll(selector)
                elements.forEach(el => el.parentNode?.removeChild(el))
            })
            // Remove any injected styles
            const gwtStyles = document.querySelectorAll('style[id^="goog-gt-"]')
            gwtStyles.forEach(style => style.parentNode?.removeChild(style))
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            const translateElement = document.querySelector('.goog-te-combo') as HTMLSelectElement
            if (translateElement) {
                translateElement.value = selectedLang
                translateElement.dispatchEvent(new Event('change'))
                clearInterval(interval)
            }
        }, 50)

        return () => clearInterval(interval)
    }, [selectedLang])

    return (
        <>
            <div id="google_translate_element" className="hidden" />
            <Select value={selectedLang} onValueChange={setSelectedLang}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                    {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </>
    )
}