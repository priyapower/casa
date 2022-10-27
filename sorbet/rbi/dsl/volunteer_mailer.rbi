# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `VolunteerMailer`.
# Please instead update this file by running `bin/tapioca dsl VolunteerMailer`.

class VolunteerMailer
  class << self
    sig { params(user: T.untyped).returns(::ActionMailer::MessageDelivery) }
    def account_setup(user); end

    sig { params(user: T.untyped, cc_recipients: T.untyped).returns(::ActionMailer::MessageDelivery) }
    def case_contacts_reminder(user, cc_recipients); end

    sig { params(user: T.untyped, court_report_due_date: T.untyped).returns(::ActionMailer::MessageDelivery) }
    def court_report_reminder(user, court_report_due_date); end

    sig { params(user: T.untyped).returns(::ActionMailer::MessageDelivery) }
    def password_changed_reminder(user); end
  end
end