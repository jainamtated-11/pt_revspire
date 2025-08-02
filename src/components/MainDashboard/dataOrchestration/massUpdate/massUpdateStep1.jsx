import React, { useContext, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { GlobalContext } from "../../../../context/GlobalState";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import { useQuery } from "@tanstack/react-query"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  crmConnection: z.string().min(1, 'CRM Connection is required'),
})

const axiosInstance = useAxiosInstance();

function CreateMassUpdateTask({ open = false, onOpenChange }) {
  const [currentStep, setCurrentStep] = useState(1)
  const { baseURL, viewer_id } = useContext(GlobalContext)
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      crmConnection: '',
    },
  })

  const { data: crmConnections, isLoading } = useQuery({
    queryKey: ['crmConnections'],
    queryFn: async () => {
      const response = await axiosInstance.post(`${baseURL}/view-all-crm-connections`, {
        viewer_id,
      })
      return response.data.connections
    },
  })

  const onSubmit = async (values) => {
    // Handle form submission
    console.log(values)
    // Move to next step
    setCurrentStep(2)
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Create Mass Update Task
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-4">
            Step {currentStep} of 7
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter task description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="crmConnection"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CRM Connection</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select CRM connection" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoading ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : (
                          crmConnections?.map((connection) => (
                            <SelectItem
                              key={connection.id}
                              value={connection.id}
                            >
                              {`${connection.crm_username} - ${connection.owner_name}`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                  >
                    Back
                  </Button>
                  <Button type="submit">
                    Next
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateMassUpdateTask