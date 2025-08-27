"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Trash2, GripVertical, PlusCircle, ToggleLeft, ToggleRight } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { PersonalDetailField, PersonalDetailsConfig } from "./personal-details-collector"
import { Card, CardContent } from "@/components/ui/card"

interface PersonalDetailsSettingsProps {
  config: PersonalDetailsConfig
  onConfigChange: (config: PersonalDetailsConfig) => void
}

// Sortable field component for drag and drop functionality
interface SortableFieldProps {
  field: PersonalDetailField;
  index: number;
  onUpdateField: (id: string, updates: Partial<PersonalDetailField>) => void;
  onAddDropdownOption: (fieldId: string) => void;
  onUpdateDropdownOption: (fieldId: string, optionIndex: number, value: string) => void;
  onRemoveDropdownOption: (fieldId: string, optionIndex: number) => void;
  onRemoveField: (id: string) => void;
  disableRemove: boolean;
}

function SortableField({
  field,
  index,
  onUpdateField,
  onAddDropdownOption,
  onUpdateDropdownOption,
  onRemoveDropdownOption,
  onRemoveField,
  disableRemove
}: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`border rounded-2xl p-4 space-y-3 ${
        isDragging 
          ? 'bg-gray-100 border-blue-300 shadow-lg' 
          : 'hover:border-gray-300 transition-colors'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div 
          {...attributes} 
          {...listeners} 
          className="flex flex-col items-center gap-2 pt-2"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
            {index + 1}
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <Input
            value={field.label}
            onChange={(e) => onUpdateField(field.id, { label: e.target.value })}
            placeholder="Enter question"
            className="rounded-2xl"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Label className="text-sm">Type:</Label>
              <Select
                value={field.type}
                onValueChange={(value) => {
                  const updates: Partial<PersonalDetailField> = { 
                    type: value as "text" | "dropdown" | "checkbox"
                  }
                  
                  if (value === "dropdown" && !field.dropdownOptions) {
                    updates.dropdownOptions = ["Option 1", "Option 2"]
                  }
                  
                  onUpdateField(field.id, updates)
                }}
              >
                <SelectTrigger className="w-32 rounded-2xl">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Input</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={field.required}
                  onCheckedChange={(checked) => onUpdateField(field.id, { required: checked })}
                  size="sm"
                  className="data-[state=checked]:bg-blue-600"
                />
                <Label className="text-sm">Required</Label>
              </div>
              <Button
                onClick={() => onRemoveField(field.id)}
                variant="ghost"
                size="sm"
                className="rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                disabled={disableRemove}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {field.type === "dropdown" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-50 rounded-2xl p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-sm">Dropdown Configuration</h5>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={field.allowMultiple || false}
                    onCheckedChange={(checked) => onUpdateField(field.id, { allowMultiple: checked })}
                    size="sm"
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Label className="text-sm">Allow multiple selection</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Options</Label>
                <div className="space-y-2">
                  {(field.dropdownOptions || []).map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <Input
                        placeholder="Option text"
                        value={option}
                        onChange={(e) => onUpdateDropdownOption(field.id, optionIndex, e.target.value)}
                        className="rounded-2xl flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-2xl"
                        onClick={() => onRemoveDropdownOption(field.id, optionIndex)}
                        disabled={(field.dropdownOptions || []).length <= 1}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-2xl bg-white"
                    onClick={() => onAddDropdownOption(field.id)}
                  >
                    <PlusCircle className="h-3 w-3 mr-1" />
                    Add Option
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function PersonalDetailsSettings({ config, onConfigChange }: PersonalDetailsSettingsProps) {
  const [includePersonalDetails, setIncludePersonalDetails] = useState(config.includePersonalDetails)
  const [personalFields, setPersonalFields] = useState<PersonalDetailField[]>(config.personalFields)
  
  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // This ensures a small movement is needed before drag starts
        // to avoid conflicts with click events
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleToggleIncludePersonalDetails = () => {
    const newValue = !includePersonalDetails
    setIncludePersonalDetails(newValue)
    onConfigChange({
      includePersonalDetails: newValue,
      personalFields
    })
  }

  const handleAddField = () => {
    const newField: PersonalDetailField = {
      id: crypto.randomUUID(),
      label: "New Question",
      type: "text",
      required: true
    }
    const newFields = [...personalFields, newField]
    setPersonalFields(newFields)
    onConfigChange({
      includePersonalDetails,
      personalFields: newFields
    })
  }

  const handleRemoveField = (id: string) => {
    const newFields = personalFields.filter(field => field.id !== id)
    setPersonalFields(newFields)
    onConfigChange({
      includePersonalDetails,
      personalFields: newFields
    })
  }

  const handleUpdateField = (id: string, updates: Partial<PersonalDetailField>) => {
    const newFields = personalFields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    )
    setPersonalFields(newFields)
    onConfigChange({
      includePersonalDetails,
      personalFields: newFields
    })
  }
  
  // Handle the end of a drag operation
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    // If no over element or same element, no reordering needed
    if (!over || active.id === over.id) {
      return
    }
    
    // Find the indices of the dragged item and the drop target
    const oldIndex = personalFields.findIndex(field => field.id === active.id)
    const newIndex = personalFields.findIndex(field => field.id === over.id)
    
    // Update the array order using arrayMove from dnd-kit
    const newFields = arrayMove(personalFields, oldIndex, newIndex)
    setPersonalFields(newFields)
    onConfigChange({
      includePersonalDetails,
      personalFields: newFields
    })
  }

  const handleAddDropdownOption = (fieldId: string) => {
    const newFields = personalFields.map(field => {
      if (field.id === fieldId) {
        const currentOptions = field.dropdownOptions || []
        return {
          ...field,
          dropdownOptions: [...currentOptions, "New Option"]
        }
      }
      return field
    })
    setPersonalFields(newFields)
    onConfigChange({
      includePersonalDetails,
      personalFields: newFields
    })
  }

  const handleUpdateDropdownOption = (fieldId: string, optionIndex: number, value: string) => {
    const newFields = personalFields.map(field => {
      if (field.id === fieldId && field.dropdownOptions) {
        const newOptions = [...field.dropdownOptions]
        newOptions[optionIndex] = value
        return {
          ...field,
          dropdownOptions: newOptions
        }
      }
      return field
    })
    setPersonalFields(newFields)
    onConfigChange({
      includePersonalDetails,
      personalFields: newFields
    })
  }

  const handleRemoveDropdownOption = (fieldId: string, optionIndex: number) => {
    const newFields = personalFields.map(field => {
      if (field.id === fieldId && field.dropdownOptions) {
        const newOptions = field.dropdownOptions.filter((_, i) => i !== optionIndex)
        return {
          ...field,
          dropdownOptions: newOptions
        }
      }
      return field
    })
    setPersonalFields(newFields)
    onConfigChange({
      includePersonalDetails,
      personalFields: newFields
    })
  }

  return (
    <div className="w-full space-y-6">
      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Personal Details Collection</h4>
              <p className="text-sm text-muted-foreground">
                Collect basic information from candidates before the interview
              </p>
            </div>
            <Switch
              checked={includePersonalDetails}
              onCheckedChange={handleToggleIncludePersonalDetails}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </CardContent>
      </Card>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: includePersonalDetails ? 1 : 0,
          height: includePersonalDetails ? "auto" : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        {includePersonalDetails && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Personal Detail Fields</h4>
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl bg-transparent"
                onClick={handleAddField}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Field
              </Button>
            </div>

            <div className="space-y-4">
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={personalFields.map(field => field.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {personalFields.map((field, index) => (
                    <SortableField
                      key={field.id}
                      field={field}
                      index={index}
                      onUpdateField={handleUpdateField}
                      onAddDropdownOption={handleAddDropdownOption}
                      onUpdateDropdownOption={handleUpdateDropdownOption}
                      onRemoveDropdownOption={handleRemoveDropdownOption}
                      onRemoveField={handleRemoveField}
                      disableRemove={personalFields.length <= 1}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}