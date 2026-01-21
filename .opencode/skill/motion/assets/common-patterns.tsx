/**
 * Common Motion Animation Patterns
 * 
 * Ready-to-use components for typical animation scenarios.
 */

import { motion, AnimatePresence } from "motion/react"

// =============================================================================
// 1. FADE IN ON MOUNT
// =============================================================================

export function FadeIn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// =============================================================================
// 2. SLIDE IN FROM BOTTOM
// =============================================================================

export function SlideUp({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring" }}
    >
      {children}
    </motion.div>
  )
}

// =============================================================================
// 3. INTERACTIVE BUTTON
// =============================================================================

export function AnimatedButton({ children, onClick }: { 
  children: React.ReactNode
  onClick?: () => void 
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.button>
  )
}

// =============================================================================
// 4. MODAL WITH BACKDROP
// =============================================================================

export function Modal({ 
  isOpen, 
  onClose, 
  children 
}: { 
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />
          
          {/* Modal Content */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// =============================================================================
// 5. STAGGERED LIST
// =============================================================================

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
}

export function StaggeredList({ items }: { items: string[] }) {
  return (
    <motion.ul
      variants={listVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item, i) => (
        <motion.li
          key={i}
          variants={itemVariants}
        >
          {item}
        </motion.li>
      ))}
    </motion.ul>
  )
}

// =============================================================================
// 6. EXPANDABLE PANEL
// =============================================================================

export function ExpandablePanel({ 
  title, 
  children,
  isOpen,
  onToggle
}: { 
  title: string
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <motion.button
        onClick={onToggle}
        className="w-full p-4 text-left bg-gray-100"
        whileHover={{ backgroundColor: "rgba(229, 231, 235, 1)" }}
      >
        {title}
      </motion.button>
      
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="p-4">
          {children}
        </div>
      </motion.div>
    </div>
  )
}

// =============================================================================
// 7. SCROLL-TRIGGERED FADE IN
// =============================================================================

export function ScrollFadeIn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  )
}

// =============================================================================
// 8. LOADING SPINNER
// =============================================================================

export function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
      className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full"
    />
  )
}

// =============================================================================
// 9. TAB SWITCHER (WITH EXIT ANIMATIONS)
// =============================================================================

export function TabContent({ 
  activeTab, 
  content 
}: { 
  activeTab: string
  content: Record<string, React.ReactNode>
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {content[activeTab]}
      </motion.div>
    </AnimatePresence>
  )
}

// =============================================================================
// 10. HOVER CARD
// =============================================================================

export function HoverCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)"
      }}
      transition={{ type: "spring", stiffness: 300 }}
      className="rounded-lg bg-white p-6 shadow-md"
    >
      {children}
    </motion.div>
  )
}

// =============================================================================
// 11. DRAG TO DISMISS (e.g., notifications)
// =============================================================================

export function DraggableNotification({ 
  onDismiss,
  children 
}: { 
  onDismiss: () => void
  children: React.ReactNode
}) {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(_, info) => {
        // Dismiss if dragged far enough
        if (Math.abs(info.offset.x) > 100) {
          onDismiss()
        }
      }}
      className="bg-white rounded-lg shadow-lg p-4 cursor-grab active:cursor-grabbing"
    >
      {children}
    </motion.div>
  )
}

// =============================================================================
// 12. LAYOUT ANIMATION (GRID REORDERING)
// =============================================================================

export function ReorderableGrid({ 
  items 
}: { 
  items: Array<{ id: string; content: React.ReactNode }> 
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map(item => (
        <motion.div
          key={item.id}
          layout // Animates position changes
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-lg p-4 shadow"
        >
          {item.content}
        </motion.div>
      ))}
    </div>
  )
}
