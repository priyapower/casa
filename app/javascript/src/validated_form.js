/* global $ */
const { Notifier } = require('./notifier')
const TypeChecker = require('./type_checker')

const GET_ERROR_STATE_UNDEFINED_MESSAGE = 'getErrorState for the component is not defined'
const GET_WARNING_STATE_UNDEFINED_MESSAGE = 'getWarningState for the component is not defined'

// Abstract Class
class ValidatableFormSectionComponent {
  constructor (componentElementsAsJQuery, notifier) {
    TypeChecker.checkNonEmptyJQueryObject(componentElementsAsJQuery, 'componentElementsAsJQuery')

    if (!(notifier instanceof Notifier)) {
      console.error('Warning: unable to show notifications to the user')
    } else {
      this.notifier = notifier
    }

    this.componentElementsAsJQuery = componentElementsAsJQuery
  }

  // Implement the 4 methods below for an error validation component

  // @returns A string describing the invalid state of the inputs for the user to read, empty string if the inputs are valid
  getErrorState () {
    throw new ReferenceError(GET_ERROR_STATE_UNDEFINED_MESSAGE)
  }

  // @param  {string} errorState The value returned by getErrorState()
  errorHighlightUI (errorState) {
    // Highlights the error input area for the user to see easier
    // If there is no error, returns the component back to the original state
    throw new ReferenceError('errorHighlightUI for the component is not defined')
  }

  showUserError (errorMsg) {
    // Shows the error message to the user
    throw new ReferenceError('showUserError for the component is not defined')
  }

  removeUserError () {
    // Removes the error displayed to the user
    throw new ReferenceError('clearUserError for the component is not defined')
  }

  // Implement the 6 methods below for a warning validation component

  // @returns A string describing the potentially invalid state of the inputs for the user to read, empty string if there is nothing to warn about
  getWarningState () {
    throw new ReferenceError(GET_WARNING_STATE_UNDEFINED_MESSAGE)
  }

  // @param  {string} errorState The value returned by getWarningState()
  warningHighlightUI (errorState) {
    // Highlights the warning input area for the user to see easier
    // If there is no warning, returns the component back to the original state
    throw new ReferenceError('warningHighlightUI for the component is not defined')
  }

  showUserWarning (warningMsg) {
    // Shows the warning notification to the user
    throw new ReferenceError('showUserWarning for the component is not defined')
  }

  removeUserWarning () {
    // Removes the warning notification displayed to the user
    throw new ReferenceError('clearUserWarning for the component is not defined')
  }

  showWarningConfirmation () {
    // Shows UI requiring the user to acknowledge the warning
    throw new ReferenceError('showWarningConfirmation for the component is not defined')
  }

  removeWarningConfirmation () {
    // Removes UI requiring the user to acknowledge the warning
    throw new ReferenceError('removeWarningConfirmation for the component is not defined')
  }

  validate () {
    let errorMsg
    let errorValidationDisabled = false
    let warningMsg
    let warningValidationDisabled = false

    try {
      errorMsg = this.#validateError()
    } catch (err) {
      if (err instanceof ReferenceError && err.message === GET_ERROR_STATE_UNDEFINED_MESSAGE) {
        errorValidationDisabled = true
      } else {
        throw err
      }
    }

    try {
      warningMsg = this.#validateWarning()
    } catch (err) {
      if (err instanceof ReferenceError && err.message === GET_WARNING_STATE_UNDEFINED_MESSAGE) {
        warningValidationDisabled = true
      } else {
        throw err
      }
    }

    if (errorValidationDisabled && warningValidationDisabled) {
      throw new ReferenceError('No validations are implemented for this component')
    }

    const messages = {}

    if (errorMsg) {
      messages.error = errorMsg
    }

    if (warningMsg) {
      messages.warning = warningMsg
    }

    return messages
  }

  #validateError () {
    const errorState = this.getErrorState()

    if (errorState) {
      this.showUserError(errorState)
    } else {
      this.removeUserError()
    }

    this.errorHighlightUI(errorState)
    return errorState
  }

  #validateWarning () {
    const warningMsg = this.getWarningState()

    if (warningMsg) {
      this.showUserWarning(warningMsg)
      this.showWarningConfirmation()
    } else {
      this.removeUserWarning(warningMsg)
      this.removeWarningConfirmation()
    }

    this.warningHighlightUI(warningMsg)

    return warningMsg
  }
}

class RangedDatePicker extends ValidatableFormSectionComponent {
  constructor (componentElementsAsJQuery, notifier) {
    super(componentElementsAsJQuery, notifier)

    const maxDateValue = this.componentElementsAsJQuery.attr('data-max-date')
    const minDateValue = this.componentElementsAsJQuery.attr('data-min-date')
    this.name = this.componentElementsAsJQuery.attr('component-name')

    const max = maxDateValue === 'today' ? new Date() : new Date(maxDateValue)
    const min = minDateValue === 'today' ? new Date() : new Date(minDateValue)

    this.max = max
    this.min = min

    if (min instanceof Date && max instanceof Date && max < min) {
      throw new RangeError('The minimum date for the component was set to be later than the maximum date')
    }
  }

  errorHighlightUI (errorState) {
    if (errorState) {
      this.componentElementsAsJQuery.css('border', '2px solid red')
    } else {
      this.componentElementsAsJQuery.css('border', '')
    }
  }

  getErrorState () {
    const setDate = new Date(this.componentElementsAsJQuery.val())
    const { max, min } = this

    if (setDate > max && !isNaN(max)) {
      return `Date for ${this.name} is past maximum allowed date of ${max.toDateString()}`
    } else if (setDate < min && !isNaN(min)) {
      return `Date for ${this.name} is behind minimum allowed date of ${min.toDateString()}`
    }
  }

  showUserError (errorMsg) {
    TypeChecker.checkNonEmptyString(errorMsg, 'errorMsg')

    if (this.errorNotification) {
      this.errorNotification.setText(errorMsg)
    } else if (this.notifier) {
      this.errorNotification = this.notifier.notify(errorMsg, 'error', false)
    }
  }

  removeUserError () {
    if (this.errorNotification) {
      this.errorNotification.dismiss()
      delete this.errorNotification
    }
  }
}

class NonDrivingContactMediumWarning extends ValidatableFormSectionComponent {
  constructor (allInputs, notifier) {
    super(allInputs, notifier)

    const milesDrivenInput = allInputs.filter('#case_contact_miles_driven')
    const contactMediumCheckboxes = allInputs.not(milesDrivenInput)

    this.drivingContactMediumCheckbox = contactMediumCheckboxes.filter('#case_contact_medium_type_in-person')
    this.nonDrivingContactMediumCheckboxes = contactMediumCheckboxes.not(this.drivingContactMediumCheckbox)
    this.checkboxContainer = this.drivingContactMediumCheckbox.parents('.contact-medium.form-group')
    this.milesDrivenInput = milesDrivenInput

    this.notifier = notifier
  }

  getWarningState () {
    if (this.nonDrivingContactMediumCheckboxes.filter(':checked').length && Number.parseInt(this.milesDrivenInput.val())) {
      return 'You requested driving reimbursement for a contact medium that typically does not involve driving. Are you sure that\'s right?'
    }

    return ''
  }

  // @param  {string} errorState The value returned by getWarningState()
  warningHighlightUI (errorState) {
    if (errorState) {
      this.checkboxContainer.css('background-color', '#fff8e1')
      this.milesDrivenInput.css('border', '2px solid #ffc107')
    } else {
      this.checkboxContainer.css('background-color', '')
      this.milesDrivenInput.css('border', '')
    }
  }

  showUserWarning (warningMsg) {
    TypeChecker.checkNonEmptyString(warningMsg, 'warningMsg')

    if (this.warningNotification) {
      this.warningNotification.setText(warningMsg)
    } else if (this.notifier) {
      this.warningNotification = this.notifier.notify(warningMsg, 'warn')
    }
  }

  removeUserWarning () {
    if (this.warningNotification) {
      if (!(this.warningNotification.isDismissed())) {
        this.warningNotification.dismiss()
      }

      delete this.warningNotification
    }
  }

  showWarningConfirmation () {
    this.checkboxContainer.append($(
`<div class="warning-required-checkbox">
  <input type="checkbox" id="warning-non-driving-contact-medium-check" class="form-check-input" required="true">
  <label for="warning-non-driving-contact-medium-check">I'm sure I drove for this contact medium.</label>
</div>`
    ))
  }

  removeWarningConfirmation () {
    this.checkboxContainer.find('.warning-required-checkbox').remove()
  }
}

function safeInstantiateComponent (componentName, instantiate) {
  try {
    instantiate()
  } catch (e) {
    console.error(`Failed to instantiate ${componentName} with the following jQuery object:`, $(this))
    console.error('Instantiation failed with error:', e)
  }
}

$(() => { // JQuery's callback for the DOM loading
  const validatedFormCollection = $('.component-validated-form')
  const validatableFormSectionComponents = []

  let formErrorCountNotification

  if (!(validatedFormCollection.length)) {
    return
  }

  const notificationsElement = $('#notifications')
  const pageNotifier = notificationsElement.length ? new Notifier(notificationsElement) : null

  validatedFormCollection.find('.component-date-picker-range').each(function () {
    safeInstantiateComponent('ranged date picker', () => {
      validatableFormSectionComponents.push(new RangedDatePicker($(this), pageNotifier))
    })
  })

  if ($('#case_contact_miles_driven').length) {
    safeInstantiateComponent('non driving contact medium warning', () => {
      const contactMediumWithMilesDrivenWarning = new NonDrivingContactMediumWarning(validatedFormCollection.find('.contact-medium.form-group input:not([type=hidden]), #case_contact_miles_driven'), pageNotifier)
      console.log(contactMediumWithMilesDrivenWarning)
      validatableFormSectionComponents.push(contactMediumWithMilesDrivenWarning)
    })
  }

  validatedFormCollection.on('submit', function (e) {
    let errorCount = 0
    let warningCount = 0

    for (const validatableFormSectionComponent of validatableFormSectionComponents) {
      try {
        const validationResult = validatableFormSectionComponent.validate()

        if (validationResult.error) {
          errorCount++
        }

        if (validationResult.warning) {
          warningCount++
        }
      } catch (err) {
        console.error('Failed to validate the following component:', validatableFormSectionComponent)
        console.error('Validation threw error:', err)
      }
    }

    if (errorCount) {
      e.preventDefault()

      if (formErrorCountNotification) {
        formErrorCountNotification.setText(`${errorCount} error${errorCount > 1 ? 's' : ''} need${errorCount > 1 ? '' : 's'} to be fixed before you can submit.`)
      } else {
        formErrorCountNotification = pageNotifier.notify(`${errorCount} error${errorCount > 1 ? 's' : ''} need${errorCount > 1 ? '' : 's'} to be fixed before you can submit.`, 'error', false)
      }
    } else {
      if (formErrorCountNotification) {
        formErrorCountNotification.dismiss()
        $(e.currentTarget).trigger('submit')
      }
    }
  })
})

module.exports = { NonDrivingContactMediumWarning, RangedDatePicker }
