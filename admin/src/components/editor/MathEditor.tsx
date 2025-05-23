'use client'

import { useState } from 'react'
import { Calculator, Eye, EyeOff } from 'lucide-react'

interface MathEditorProps {
  onMathInsert: (latex: string, inline?: boolean) => void
}

export default function MathEditor({ onMathInsert }: MathEditorProps) {
  const [latex, setLatex] = useState('')
  const [showPreview, setShowPreview] = useState(true)
  const [isInline, setIsInline] = useState(false)
  const [error, setError] = useState('')

  const validateLatex = (input: string): boolean => {
    // Basic LaTeX validation
    const openBraces = (input.match(/{/g) || []).length
    const closeBraces = (input.match(/}/g) || []).length
    
    if (openBraces !== closeBraces) {
      setError('Mismatched braces')
      return false
    }

    // Check for common LaTeX commands
    const invalidCommands = input.match(/\\[a-zA-Z]+/g)?.filter(cmd => 
      !['\\frac', '\\sqrt', '\\sum', '\\int', '\\alpha', '\\beta', '\\gamma', 
        '\\sin', '\\cos', '\\tan', '\\log', '\\ln', '\\infty', '\\pi', '\\theta',
        '\\begin', '\\end', '\\bmatrix', '\\pmatrix', '\\left', '\\right'].includes(cmd)
    )

    if (invalidCommands && invalidCommands.length > 0) {
      setError(`Invalid command: ${invalidCommands[0]}`)
      return false
    }

    setError('')
    return true
  }

  const handleLatexChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setLatex(value)
    validateLatex(value)
  }

  const handleInsert = () => {
    if (!latex.trim()) {
      setError('Please enter a formula')
      return
    }

    if (!validateLatex(latex)) {
      return
    }

    onMathInsert(latex, isInline)
    setLatex('')
    setError('')
  }

  const renderPreview = (latexStr: string): string => {
    // Simple LaTeX to Unicode conversion for preview
    const conversions: Record<string, string> = {
      '\\alpha': 'α',
      '\\beta': 'β',
      '\\gamma': 'γ',
      '\\delta': 'δ',
      '\\epsilon': 'ε',
      '\\pi': 'π',
      '\\theta': 'θ',
      '\\lambda': 'λ',
      '\\mu': 'μ',
      '\\sigma': 'σ',
      '\\phi': 'φ',
      '\\omega': 'ω',
      '\\infty': '∞',
      '\\pm': '±',
      '\\mp': '∓',
      '\\times': '×',
      '\\div': '÷',
      '\\leq': '≤',
      '\\geq': '≥',
      '\\neq': '≠',
      '\\approx': '≈',
      '\\equiv': '≡',
      '\\sum': '∑',
      '\\prod': '∏',
      '\\int': '∫',
      '\\sqrt': '√',
      '{': '',
      '}': '',
      '^2': '²',
      '^3': '³',
      '_0': '₀',
      '_1': '₁',
      '_2': '₂',
      '_i': 'ᵢ',
      '_n': 'ₙ',
    }

    let result = latexStr
    for (const [latex, unicode] of Object.entries(conversions)) {
      result = result.replace(new RegExp(latex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), unicode)
    }

    // Handle fractions
    result = result.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
    
    return result
  }

  const commonFormulas = [
    { name: 'Quadratic Formula', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
    { name: 'Pythagorean Theorem', latex: 'a^2 + b^2 = c^2' },
    { name: 'Einstein Equation', latex: 'E = mc^2' },
    { name: 'Euler Formula', latex: 'e^{i\\pi} + 1 = 0' },
    { name: 'Derivative', latex: '\\frac{d}{dx}f(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}' },
    { name: 'Integral', latex: '\\int_a^b f(x) dx' },
    { name: 'Summation', latex: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}' },
    { name: 'Matrix', latex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}' },
  ]

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white" data-testid="math-editor">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Math Formula
        </h3>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="text-gray-500 hover:text-gray-700"
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Formula Type */}
      <div className="flex gap-4">
        <label className="flex items-center">
          <input
            type="radio"
            checked={isInline}
            onChange={() => setIsInline(true)}
            className="mr-2"
          />
          Inline
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            checked={!isInline}
            onChange={() => setIsInline(false)}
            className="mr-2"
          />
          Block
        </label>
      </div>

      {/* LaTeX Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          LaTeX Formula
        </label>
        <textarea
          value={latex}
          onChange={handleLatexChange}
          placeholder="Enter LaTeX formula, e.g., E = mc^2"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          rows={3}
          data-testid="math-input"
        />
      </div>

      {/* Preview */}
      {showPreview && latex && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview
          </label>
          <div 
            className={`p-3 bg-gray-50 rounded border ${isInline ? 'inline-block' : 'block text-center'}`}
            data-testid="math-preview"
          >
            {renderPreview(latex)}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" data-testid="math-error">
          {error}
        </div>
      )}

      {/* Common Formulas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Common Formulas
        </label>
        <div className="grid grid-cols-2 gap-2">
          {commonFormulas.map((formula, index) => (
            <button
              key={index}
              onClick={() => setLatex(formula.latex)}
              className="p-2 text-left text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">{formula.name}</div>
              <div className="text-gray-500 font-mono text-xs truncate">
                {formula.latex}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Insert Button */}
      <button
        onClick={handleInsert}
        disabled={!latex.trim() || !!error}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Insert Formula
      </button>
    </div>
  )
}